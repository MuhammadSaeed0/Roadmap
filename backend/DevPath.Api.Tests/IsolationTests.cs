using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Services;

namespace DevPath.Api.Tests;

/// <summary>
/// Two accounts, A and B. B must never see, change or delete A's data, even by sending
/// A's ids directly; shared learning content stays the same for both.
/// </summary>
public class IsolationTests(ApiFactory factory) : IClassFixture<ApiFactory>, IAsyncLifetime
{
    private HttpClient _a = null!;
    private HttpClient _b = null!;

    public async Task InitializeAsync()
    {
        _a = await factory.CreateUserClientAsync();
        _b = await factory.CreateUserClientAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    private static async Task<JsonNode> Json(HttpResponseMessage response) =>
        JsonNode.Parse(await response.Content.ReadAsStringAsync())!;

    [Fact]
    public async Task Notes_are_private_including_direct_id_access()
    {
        var created = await _a.PostAsJsonAsync("/api/notes", new { title = "A's secret plan", content = "only for A", topicId = 1 });
        var id = (await Json(created))["id"]!.GetValue<int>();

        Assert.Empty((await Json(await _b.GetAsync("/api/notes"))).AsArray());
        Assert.Empty((await Json(await _b.GetAsync("/api/notes?q=secret"))).AsArray());
        Assert.Equal(HttpStatusCode.NotFound, (await _b.GetAsync($"/api/notes/{id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _b.PutAsJsonAsync($"/api/notes/{id}", new { title = "hijacked", content = "" })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _b.DeleteAsync($"/api/notes/{id}")).StatusCode);

        var search = await Json(await _b.GetAsync("/api/search?q=secret"));
        Assert.DoesNotContain(search["groups"]!.AsArray(), g => g!["category"]!.GetValue<string>() == "notes");

        var mine = await Json(await _a.GetAsync($"/api/notes/{id}"));
        Assert.Equal("A's secret plan", mine["title"]!.GetValue<string>());   // untouched by B
    }

    [Fact]
    public async Task Topic_progress_and_reviews_are_per_account()
    {
        await _a.PutAsJsonAsync("/api/topics/5/progress", new { status = "Completed", knowledge = "AlreadyKnow", confidence = 5 });
        await _a.PutAsync("/api/reviews/5", null);

        var forB = await Json(await _b.GetAsync("/api/topics/5"));
        Assert.Equal("NotStarted", forB["status"]!.GetValue<string>());
        Assert.Null(forB["review"]);
        Assert.Empty((await Json(await _b.GetAsync("/api/reviews")))["upcoming"]!.AsArray());
        Assert.Equal(HttpStatusCode.NotFound, (await _b.DeleteAsync("/api/reviews/5")).StatusCode);   // can't remove A's review

        // B's own progress on the same topic is a separate row and doesn't change A's.
        await _b.PutAsJsonAsync("/api/topics/5/progress", new { status = "InProgress", knowledge = "NeedToLearn", confidence = 1 });
        var forA = await Json(await _a.GetAsync("/api/topics/5"));
        Assert.Equal("Completed", forA["status"]!.GetValue<string>());
        Assert.Equal(5, forA["confidence"]!.GetValue<int>());
        Assert.NotNull(forA["review"]);
    }

    [Fact]
    public async Task Study_sessions_cannot_be_deleted_by_another_account()
    {
        var created = await _a.PostAsJsonAsync("/api/study-sessions",
            new { topicId = 2, actualMinutes = 25, sessionDate = DateTime.Today.ToString("yyyy-MM-dd") });
        var id = (await Json(created))["id"]!.GetValue<int>();

        Assert.Empty((await Json(await _b.GetAsync("/api/study-sessions"))).AsArray());
        Assert.Equal(HttpStatusCode.NotFound, (await _b.DeleteAsync($"/api/study-sessions/{id}")).StatusCode);
        Assert.Single((await Json(await _a.GetAsync("/api/study-sessions"))).AsArray());
    }

    [Fact]
    public async Task Projects_practice_interviews_and_preferences_are_per_account()
    {
        await _a.PutAsJsonAsync("/api/project-tasks/1/progress", new { status = "Completed" });
        await _a.PutAsJsonAsync("/api/projects/1/repository", new { repositoryUrl = "https://github.com/a/private-repo" });
        await _a.PutAsJsonAsync("/api/projects/1/portfolio/1", new { isDone = true });
        await _a.PutAsJsonAsync("/api/practice/1/attempt", new { answer = "A's answer" });
        await _a.PutAsJsonAsync("/api/interviews/1/progress", new { rating = "Confident" });
        await _a.PutAsJsonAsync("/api/preferences", new { dailyGoalMinutes = 120, allowSkippingPrerequisites = true, focusSkill = "Angular", weekStartsOn = "Sunday" });

        var project = await Json(await _b.GetAsync("/api/projects/1"));
        Assert.Null(project["repositoryUrl"]);
        Assert.All(project["milestones"]!.AsArray().SelectMany(m => m!["tasks"]!.AsArray()), t => Assert.Equal("NotStarted", t!["status"]!.GetValue<string>()));
        Assert.All(project["portfolio"]!.AsArray(), i => Assert.False(i!["isDone"]!.GetValue<bool>()));

        var exercise = await Json(await _b.GetAsync("/api/practice/1"));
        Assert.Null(exercise["userAnswer"]);
        Assert.Equal(HttpStatusCode.Conflict, (await _b.PostAsync("/api/practice/1/solution", null)).StatusCode);   // B hasn't attempted it

        var question = (await Json(await _b.GetAsync("/api/interviews")))["questions"]!.AsArray().First(q => q!["id"]!.GetValue<int>() == 1)!;
        Assert.Null(question["rating"]);

        var prefs = await Json(await _b.GetAsync("/api/preferences"));
        Assert.Equal(60, prefs["dailyGoalMinutes"]!.GetValue<int>());

        Assert.Equal("https://github.com/a/private-repo", (await Json(await _a.GetAsync("/api/projects/1")))["repositoryUrl"]!.GetValue<string>());
    }

    [Fact]
    public async Task Dashboard_and_progress_only_count_your_own_activity()
    {
        await _a.PutAsJsonAsync("/api/topics/3/progress", new { status = "Completed", knowledge = "Unassessed", confidence = 4 });
        await _a.PostAsJsonAsync("/api/study-sessions", new { topicId = 3, actualMinutes = 60, sessionDate = DateTime.Today.ToString("yyyy-MM-dd") });

        var dashboardB = await Json(await _b.GetAsync("/api/dashboard"));
        Assert.Equal(0, dashboardB["overall"]!["doneTopics"]!.GetValue<int>());
        Assert.Empty(dashboardB["recentActivity"]!.AsArray());

        var dashboardA = await Json(await _a.GetAsync("/api/dashboard"));
        Assert.Equal(1, dashboardA["overall"]!["doneTopics"]!.GetValue<int>());
    }

    [Fact]
    public async Task Shared_content_is_the_same_for_everyone()
    {
        var roadmapA = await Json(await _a.GetAsync("/api/roadmap"));
        var roadmapB = await Json(await _b.GetAsync("/api/roadmap"));
        Assert.Equal(roadmapA["phases"]!.AsArray().Count, roadmapB["phases"]!.AsArray().Count);
        Assert.Equal(
            (await Json(await _a.GetAsync("/api/topics/1")))["titleEn"]!.GetValue<string>(),
            (await Json(await _b.GetAsync("/api/topics/1")))["titleEn"]!.GetValue<string>());
        Assert.Equal((await Json(await _a.GetAsync("/api/resources"))).AsArray().Count, (await Json(await _b.GetAsync("/api/resources"))).AsArray().Count);
    }

    [Fact]
    public async Task Added_videos_and_flags_are_private()
    {
        factory.YouTube.Lookups["dQw4w9WgXcQ"] = new VideoLookupResult(VideoLookupStatus.Found, "A's pick", "Channel");
        var added = await Json(await _a.PostAsJsonAsync("/api/topics/1/videos", new { url = "https://youtu.be/dQw4w9WgXcQ" }));
        var addedId = added["addedId"]!.GetValue<int>();
        await _a.PutAsJsonAsync("/api/videos/dQw4w9WgXcQ/progress", new { topicId = 1, isWatched = true, isBookmarked = true });

        var forB = await Json(await _b.GetAsync("/api/topics/1/videos"));
        Assert.DoesNotContain(forB["videos"]!.AsArray(), v => v!["videoId"]!.GetValue<string>() == "dQw4w9WgXcQ");
        Assert.Equal(HttpStatusCode.NotFound, (await _b.DeleteAsync($"/api/topic-videos/{addedId}")).StatusCode);

        var forA = await Json(await _a.GetAsync("/api/topics/1/videos"));
        var mine = forA["videos"]!.AsArray().Single(v => v!["videoId"]!.GetValue<string>() == "dQw4w9WgXcQ")!;
        Assert.True(mine["isWatched"]!.GetValue<bool>());
        Assert.True(mine["isBookmarked"]!.GetValue<bool>());
    }
}
