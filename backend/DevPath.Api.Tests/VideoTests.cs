using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>Topic videos through the HTTP API, with YouTube replaced by <see cref="FakeYouTubeClient"/>.</summary>
public class VideoTests : IAsyncLifetime
{
    // Own host per test class instance: these tests change the fake's configuration.
    private readonly ApiFactory _factory = new();
    private HttpClient _client = null!;

    public async Task InitializeAsync()
    {
        await _factory.InitializeAsync();
        _client = await _factory.CreateUserClientAsync();
    }

    public async Task DisposeAsync() => await ((IAsyncLifetime)_factory).DisposeAsync();

    private static async Task<JsonNode> Json(HttpResponseMessage response) =>
        JsonNode.Parse(await response.Content.ReadAsStringAsync())!;

    private static YouTubeVideo Video(string id, string title, int seconds = 900, string description = "") =>
        new(id, title, "Some Channel", description, [], new DateTime(2025, 5, 1), seconds);

    [Fact]
    public async Task Suggestions_are_relevant_shared_and_cached()
    {
        string? searched = null;
        _factory.YouTube.Search = q =>
        {
            searched = q;
            return
            [
                Video("aaaaaaaaaa1", "C# Variables and Types Explained"),
                Video("aaaaaaaaaa2", "Python variables for beginners"),         // other language
                Video("aaaaaaaaaa3", "C# variables #shorts", seconds: 45),     // a Short
                Video("aaaaaaaaaa4", "C# Variables and Types Explained!"),      // same title again
                Video("aaaaaaaaaa5", "Learn C# types in 20 minutes"),
            ];
        };

        var topic = await Json(await _client.GetAsync("/api/topics/2"));
        var json = await Json(await _client.GetAsync("/api/topics/2/videos"));
        Assert.Equal("ok", json["status"]!.GetValue<string>());
        Assert.Contains(topic["titleEn"]!.GetValue<string>(), searched);
        Assert.StartsWith("C# ", searched);
        // The curated (language-tagged) videos come first; the relevant live results follow them.
        var videos = json["videos"]!.AsArray();
        var curatedCount = videos.TakeWhile(v => v!["language"] is not null).Count();
        Assert.True(curatedCount >= 2, "the topic's curated videos are listed first");
        var ids = videos.Skip(curatedCount).Select(v => v!["videoId"]!.GetValue<string>()).ToList();
        Assert.Equal(["aaaaaaaaaa1", "aaaaaaaaaa5"], ids);
        Assert.All(videos, v => Assert.Equal("suggested", v!["source"]!.GetValue<string>()));

        // A second account gets the cached list without another YouTube search.
        var other = await _factory.CreateUserClientAsync();
        var again = await Json(await other.GetAsync("/api/topics/2/videos"));
        Assert.Equal(ids, again["videos"]!.AsArray().Skip(curatedCount).Select(v => v!["videoId"]!.GetValue<string>()).ToList());
        Assert.Equal(1, _factory.YouTube.SearchCount);
    }

    [Fact]
    public async Task Without_live_results_the_curated_videos_fill_the_topic()
    {
        static List<string> Ids(JsonNode json) => json["videos"]!.AsArray().Select(v => v!["videoId"]!.GetValue<string>()).ToList();

        _factory.YouTube.IsConfigured = false;
        var noKey = await Json(await _client.GetAsync("/api/topics/3/videos"));
        Assert.Equal("ok", noKey["status"]!.GetValue<string>());
        var curated = Ids(noKey);
        Assert.InRange(curated.Count, 2, 4);
        Assert.All(curated, id => Assert.True(YouTubeIds.IsValid(id)));
        Assert.All(noKey["videos"]!.AsArray(), v => Assert.Equal("suggested", v!["source"]!.GetValue<string>()));

        _factory.YouTube.IsConfigured = true;
        _factory.YouTube.Search = _ => throw new YouTubeQuotaException("quotaExceeded");
        Assert.Equal(curated, Ids(await Json(await _client.GetAsync("/api/topics/3/videos"))));

        _factory.YouTube.Search = _ => throw new HttpRequestException("boom");
        Assert.Equal(curated, Ids(await Json(await _client.GetAsync("/api/topics/3/videos"))));
    }

    [Fact]
    public async Task Missing_api_key_and_quota_errors_are_reported_when_a_topic_has_no_curated_videos()
    {
        using (var scope = _factory.Services.CreateScope())
            await scope.ServiceProvider.GetRequiredService<AppDbContext>().CuratedVideos.Where(v => v.TopicId == 3).ExecuteDeleteAsync();

        _factory.YouTube.IsConfigured = false;
        var notConfigured = await Json(await _client.GetAsync("/api/topics/3/videos"));
        Assert.Equal("not_configured", notConfigured["status"]!.GetValue<string>());
        Assert.Empty(notConfigured["videos"]!.AsArray());
        Assert.False(string.IsNullOrEmpty(notConfigured["searchQuery"]!.GetValue<string>()));

        _factory.YouTube.IsConfigured = true;
        _factory.YouTube.Search = _ => throw new YouTubeQuotaException("quotaExceeded");
        Assert.Equal("quota_exceeded", (await Json(await _client.GetAsync("/api/topics/3/videos")))["status"]!.GetValue<string>());

        _factory.YouTube.Search = _ => throw new HttpRequestException("boom");
        Assert.Equal("unavailable", (await Json(await _client.GetAsync("/api/topics/3/videos")))["status"]!.GetValue<string>());
    }

    [Fact]
    public async Task Unknown_topic_returns_404()
    {
        Assert.Equal(HttpStatusCode.NotFound, (await _client.GetAsync("/api/topics/999999/videos")).StatusCode);
    }

    [Fact]
    public async Task Adding_a_video_by_link_validates_it_with_youtube()
    {
        _factory.YouTube.IsConfigured = false;
        _factory.YouTube.Lookups["bbbbbbbbbb1"] = new VideoLookupResult(VideoLookupStatus.Found, "Great talk", "Conf Channel");
        _factory.YouTube.Lookups["bbbbbbbbbb2"] = new VideoLookupResult(VideoLookupStatus.NotEmbeddable);

        async Task<(HttpStatusCode Status, string? Code)> Add(string url)
        {
            var response = await _client.PostAsJsonAsync("/api/topics/4/videos", new { url });
            return (response.StatusCode, response.IsSuccessStatusCode ? null : (await Json(response))["code"]?.GetValue<string>());
        }

        Assert.Equal((HttpStatusCode.BadRequest, "invalid_url"), await Add("https://evil.example/watch?v=bbbbbbbbbb1"));
        Assert.Equal((HttpStatusCode.BadRequest, "invalid_url"), await Add("javascript:alert(1)"));
        Assert.Equal((HttpStatusCode.NotFound, "video_not_found"), await Add("https://youtu.be/cccccccccc9"));
        Assert.Equal(((HttpStatusCode)422, "video_not_embeddable"), await Add("https://youtu.be/bbbbbbbbbb2"));

        var created = await _client.PostAsJsonAsync("/api/topics/4/videos", new { url = "https://www.youtube.com/watch?v=bbbbbbbbbb1&t=30s" });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var video = await Json(created);
        Assert.Equal("Great talk", video["title"]!.GetValue<string>());
        Assert.Equal("added", video["source"]!.GetValue<string>());

        Assert.Equal((HttpStatusCode.Conflict, "video_duplicate"), await Add("https://youtu.be/bbbbbbbbbb1"));

        var list = await Json(await _client.GetAsync("/api/topics/4/videos"));
        Assert.Contains(list["videos"]!.AsArray(), v => v!["videoId"]!.GetValue<string>() == "bbbbbbbbbb1");

        Assert.Equal(HttpStatusCode.NoContent, (await _client.DeleteAsync($"/api/topic-videos/{video["addedId"]}")).StatusCode);
        Assert.DoesNotContain((await Json(await _client.GetAsync("/api/topics/4/videos")))["videos"]!.AsArray(),
            v => v!["videoId"]!.GetValue<string>() == "bbbbbbbbbb1");
    }

    [Fact]
    public async Task Watched_and_saved_flags_are_stored_and_validated()
    {
        Assert.Equal(HttpStatusCode.NotFound, (await _client.PutAsJsonAsync("/api/videos/not-an-id/progress",
            new { topicId = 1, isWatched = true, isBookmarked = false })).StatusCode);

        var saved = await Json(await _client.PutAsJsonAsync("/api/videos/dddddddddd1/progress", new { topicId = 1, isWatched = true, isBookmarked = false }));
        Assert.True(saved["isWatched"]!.GetValue<bool>());
        var updated = await Json(await _client.PutAsJsonAsync("/api/videos/dddddddddd1/progress", new { topicId = 1, isWatched = false, isBookmarked = true }));
        Assert.False(updated["isWatched"]!.GetValue<bool>());
        Assert.True(updated["isBookmarked"]!.GetValue<bool>());
    }
}

/// <summary>Pure tests for link parsing and the relevance rules.</summary>
public class YouTubeRulesTests
{
    [Theory]
    [InlineData("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ")]
    [InlineData("https://youtu.be/dQw4w9WgXcQ?si=x", "dQw4w9WgXcQ")]
    [InlineData("https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=1", "dQw4w9WgXcQ")]
    [InlineData("https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ")]
    [InlineData("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ")]
    [InlineData("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ", null)]
    [InlineData("https://www.youtube.com/watch?v=short", null)]
    [InlineData("ftp://youtu.be/dQw4w9WgXcQ", null)]
    [InlineData("not a url", null)]
    public void Parses_only_real_youtube_video_links(string input, string? expected) =>
        Assert.Equal(expected, YouTubeIds.Parse(input));

    [Theory]
    [InlineData("Loops", SkillArea.CSharp, "C# Loops tutorial")]
    [InlineData("Angular architecture", SkillArea.Angular, "Angular architecture tutorial")]
    [InlineData("DTOs (Data Transfer Objects)", SkillArea.AspNetCore, "ASP.NET Core DTOs tutorial")]
    public void Builds_search_queries_from_the_topic(string title, SkillArea skill, string expected) =>
        Assert.Equal(expected, TopicVideoService.SearchQuery(title, skill));

    [Fact]
    public void Keywords_are_singular_and_skip_filler_words() =>
        Assert.Equal(["loop"], TopicVideoService.TopicKeywords("Loops"));

    [Theory]
    [InlineData("PT12M34S", 754)]
    [InlineData("PT1H2M3S", 3723)]
    [InlineData("P1DT1S", 86401)]
    [InlineData("garbage", null)]
    public void Reads_iso_durations(string value, int? seconds) =>
        Assert.Equal(seconds, YouTubeClient.IsoDurationSeconds(value));
}
