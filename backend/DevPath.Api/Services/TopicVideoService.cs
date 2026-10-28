using System.Text.Json;
using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DevPath.Api.Services;

/// <summary>A suggestion as stored in TopicVideoCache.VideosJson.</summary>
public record CachedVideo(string VideoId, string Title, string ChannelTitle, DateTime? PublishedAt, int? DurationSeconds);

/// <summary>
/// Videos for a topic: shared suggestions plus videos the user added by link, with the
/// user's own watched/saved flags. Suggestions come from a live YouTube search (when an API
/// key is set; cached per topic) or else from the curated list seeded with the content.
/// Suggestions are shared; everything else is private per account.
/// </summary>
public class TopicVideoService(
    AppDbContext db, IYouTubeClient youtube, IOptions<YouTubeOptions> options, TimeProvider clock, ILogger<TopicVideoService> logger)
{
    private const int MinSeconds = 180;          // leaves out Shorts and teasers
    private const int MaxSeconds = 4 * 60 * 60;  // leaves out live-stream recordings

    // How each skill is named in a search, plus words that must appear in a result so a
    // "Loops" topic doesn't return Python loops. Professional topics apply to any stack.
    private static readonly Dictionary<SkillArea, (string Term, string[] Aliases)> Skills = new()
    {
        [SkillArea.CSharp] = ("C#", ["c#", "csharp", "c sharp", ".net", "dotnet"]),
        [SkillArea.AspNetCore] = ("ASP.NET Core", ["asp.net", "aspnet", ".net", "dotnet", "web api"]),
        [SkillArea.EfCore] = ("Entity Framework Core", ["entity framework", "ef core", "efcore", ".net"]),
        [SkillArea.SqlServer] = ("SQL Server", ["sql server", "sql", "t-sql", "tsql", "mssql"]),
        [SkillArea.TypeScript] = ("TypeScript", ["typescript"]),
        [SkillArea.Angular] = ("Angular", ["angular"]),
        [SkillArea.FullStack] = ("Angular ASP.NET Core", ["angular", "asp.net", ".net", "web api", "full stack", "fullstack"]),
        [SkillArea.Testing] = (".NET", [".net", "c#", "xunit", "angular", "test"]),
        [SkillArea.Git] = ("Git", ["git", "github"]),
        [SkillArea.Professional] = ("software developer", []),
    };

    private static readonly HashSet<string> StopWords =
    [
        "and", "the", "for", "with", "from", "into", "your", "basics", "fundamentals", "concepts", "essentials",
        "useful", "modern", "practical", "end", "both", "sides", "real", "using", "what", "how",
    ];

    public async Task<TopicVideosDto> GetAsync(int topicId, CancellationToken ct)
    {
        var topic = await db.Topics.AsNoTracking().Where(t => t.Id == topicId)
            .Select(t => new { t.Id, t.TitleEn, t.Skill }).SingleOrDefaultAsync(ct)
            ?? throw new NotFoundException("Topic", topicId);
        var query = SearchQuery(topic.TitleEn, topic.Skill);
        var (status, suggestions) = await SuggestionsAsync(topic.Id, topic.TitleEn, topic.Skill, query, ct);
        if (suggestions.Count == 0)
        {
            // No live results (no API key, quota reached, YouTube unreachable or nothing relevant):
            // the curated, pre-verified videos for this topic stand in, so the topic is never empty.
            var curated = await db.CuratedVideos.AsNoTracking().Where(v => v.TopicId == topicId).OrderBy(v => v.Order)
                .Select(v => new CachedVideo(v.VideoId, v.Title, v.ChannelTitle, null, null)).ToListAsync(ct);
            if (curated.Count > 0) (status, suggestions) = ("ok", curated);
        }

        var added = await db.UserTopicVideos.AsNoTracking().Where(v => v.TopicId == topicId).OrderBy(v => v.CreatedAt).ToListAsync(ct);
        var videos = new List<TopicVideoDto>();
        var seen = new HashSet<string>();
        foreach (var v in suggestions.Where(v => seen.Add(v.VideoId)))
            videos.Add(new TopicVideoDto(v.VideoId, v.Title, v.ChannelTitle, v.PublishedAt, v.DurationSeconds, "suggested", null, false, false));
        foreach (var v in added.Where(v => seen.Add(v.VideoId)))
            videos.Add(new TopicVideoDto(v.VideoId, v.Title, v.ChannelTitle, null, null, "added", v.Id, false, false));

        var flags = await db.VideoProgress.AsNoTracking().Where(p => seen.Contains(p.VideoId)).ToDictionaryAsync(p => p.VideoId, ct);
        return new TopicVideosDto(status, query, videos.Select(v => flags.TryGetValue(v.VideoId, out var f)
            ? v with { IsWatched = f.IsWatched, IsBookmarked = f.IsBookmarked } : v).ToList());
    }

    /// <summary>
    /// Videos showing how to build a project task: the ones picked for it, topped up from its linked
    /// topics' curated videos so every task has at least <see cref="MinTaskVideos"/>.
    /// </summary>
    public async Task<TaskVideosDto> GetForTaskAsync(int taskId, CancellationToken ct)
    {
        var task = await db.ProjectTasks.AsNoTracking().Where(t => t.Id == taskId)
            .Select(t => new { t.TitleEn, TopicIds = t.TopicLinks.OrderBy(l => l.Topic.Phase.Order).ThenBy(l => l.Topic.Order).Select(l => l.TopicId).ToList() })
            .SingleOrDefaultAsync(ct) ?? throw new NotFoundException("Project task", taskId);

        var picked = await db.ProjectTaskVideos.AsNoTracking().Where(v => v.ProjectTaskId == taskId).OrderBy(v => v.Order)
            .Select(v => new { v.VideoId, v.Title, v.ChannelTitle }).ToListAsync(ct);
        var videos = picked.Select(v => new TopicVideoDto(v.VideoId, v.Title, v.ChannelTitle, null, null, "task", null, false, false)).ToList();
        if (videos.Count < MinTaskVideos && task.TopicIds.Count > 0)
        {
            var fromTopics = await db.CuratedVideos.AsNoTracking().Where(v => task.TopicIds.Contains(v.TopicId))
                .Select(v => new { v.TopicId, v.Order, v.VideoId, v.Title, v.ChannelTitle }).ToListAsync(ct);
            // Take each linked topic's best video first, then the second ones, and so on.
            var extra = fromTopics.OrderBy(v => v.Order).ThenBy(v => task.TopicIds.IndexOf(v.TopicId))
                .Where(v => videos.All(x => x.VideoId != v.VideoId)).DistinctBy(v => v.VideoId)
                .Take(MinTaskVideos + 1 - videos.Count);
            videos.AddRange(extra.Select(v => new TopicVideoDto(v.VideoId, v.Title, v.ChannelTitle, null, null, "topic", null, false, false)));
        }

        var ids = videos.Select(v => v.VideoId).ToList();
        var flags = await db.VideoProgress.AsNoTracking().Where(p => ids.Contains(p.VideoId)).ToDictionaryAsync(p => p.VideoId, ct);
        videos = videos.Select(v => flags.TryGetValue(v.VideoId, out var f) ? v with { IsWatched = f.IsWatched, IsBookmarked = f.IsBookmarked } : v).ToList();
        // Watched/saved flags are stored against a topic; the task's first linked topic stands in for it.
        return new TaskVideosDto("ok", $"{task.TitleEn} tutorial", videos, task.TopicIds.FirstOrDefault());
    }

    private const int MinTaskVideos = 3;

    /// <summary>Checks a pasted YouTube link (it must exist, be public and allow embedding) and adds it to the topic for this user.</summary>
    public async Task<TopicVideoDto> AddAsync(int topicId, string url, CancellationToken ct)
    {
        if (!await db.Topics.AnyAsync(t => t.Id == topicId, ct)) throw new NotFoundException("Topic", topicId);
        var videoId = YouTubeIds.Parse(url) ?? throw new RequestValidationException("url", "invalid_url", "Enter a YouTube video link.");
        if (await db.UserTopicVideos.AnyAsync(v => v.TopicId == topicId && v.VideoId == videoId, ct))
            throw new ApiProblemException(409, "video_duplicate", "This video is already in the list.");

        VideoLookupResult found;
        try
        {
            found = await youtube.LookupAsync(videoId, ct);
        }
        catch (HttpRequestException e)
        {
            logger.LogWarning(e, "YouTube oEmbed lookup failed for {VideoId}", videoId);
            found = new VideoLookupResult(VideoLookupStatus.Unavailable);
        }
        switch (found.Status)
        {
            case VideoLookupStatus.NotFound: throw new ApiProblemException(404, "video_not_found", "That video doesn't exist or is private.");
            case VideoLookupStatus.NotEmbeddable: throw new ApiProblemException(422, "video_not_embeddable", "The owner doesn't allow this video on other sites.");
            case VideoLookupStatus.Unavailable: throw new ApiProblemException(503, "unavailable", "YouTube couldn't be reached. Try again later.");
        }

        var video = new UserTopicVideo
        {
            TopicId = topicId, VideoId = videoId, CreatedAt = clock.GetUtcNow().UtcDateTime,
            Title = Truncate(found.Title!, 300), ChannelTitle = Truncate(found.ChannelTitle ?? "", 200),
        };
        db.UserTopicVideos.Add(video);
        await db.SaveChangesAsync(ct);

        var flags = await db.VideoProgress.AsNoTracking().SingleOrDefaultAsync(p => p.VideoId == videoId, ct);
        return new TopicVideoDto(video.VideoId, video.Title, video.ChannelTitle, null, null, "added", video.Id,
            flags?.IsWatched ?? false, flags?.IsBookmarked ?? false);
    }

    public async Task RemoveAsync(int id, CancellationToken ct)
    {
        // The query filter limits the delete to the signed-in user's rows: someone else's id is simply "not found".
        if (await db.UserTopicVideos.Where(v => v.Id == id).ExecuteDeleteAsync(ct) == 0)
            throw new NotFoundException("Video", id);
    }

    public async Task<VideoProgressDto> SetProgressAsync(string videoId, UpdateVideoProgressRequest request, CancellationToken ct)
    {
        if (!YouTubeIds.IsValid(videoId)) throw new NotFoundException("Video", videoId);
        var topicId = request.TopicId!.Value;
        if (!await db.Topics.AnyAsync(t => t.Id == topicId, ct)) throw new NotFoundException("Topic", topicId);

        var progress = await db.VideoProgress.SingleOrDefaultAsync(p => p.VideoId == videoId, ct);
        if (progress is null)
        {
            progress = new VideoProgress { VideoId = videoId };
            db.VideoProgress.Add(progress);
        }
        progress.TopicId = topicId;
        progress.IsWatched = request.IsWatched!.Value;
        progress.IsBookmarked = request.IsBookmarked!.Value;
        progress.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return new VideoProgressDto(videoId, progress.IsWatched, progress.IsBookmarked);
    }

    /// <summary>Cached suggestions when fresh; otherwise searches YouTube and refreshes the cache (falling back to stale ones on failure).</summary>
    private async Task<(string Status, IReadOnlyList<CachedVideo> Videos)> SuggestionsAsync(
        int topicId, string title, SkillArea skill, string query, CancellationToken ct)
    {
        var cache = await db.TopicVideoCache.SingleOrDefaultAsync(c => c.TopicId == topicId, ct);
        var cached = cache is null ? [] : JsonSerializer.Deserialize<List<CachedVideo>>(cache.VideosJson) ?? [];
        var now = clock.GetUtcNow().UtcDateTime;
        if (cache is not null && cache.Query == query && now - cache.FetchedAt < TimeSpan.FromDays(options.Value.CacheDays))
            return ("ok", cached);
        if (!youtube.IsConfigured) return ("not_configured", cached);

        try
        {
            var results = await youtube.SearchAsync(query, ct);
            var videos = Relevant(results, title, skill).Take(options.Value.MaxVideos).ToList();
            var json = JsonSerializer.Serialize(videos);
            if (cache is null) db.TopicVideoCache.Add(new TopicVideoCache { TopicId = topicId, Query = query, VideosJson = json, FetchedAt = now });
            else (cache.Query, cache.VideosJson, cache.FetchedAt) = (query, json, now);
            try
            {
                await db.SaveChangesAsync(ct);
            }
            catch (DbUpdateException)
            {
                // Another request cached this topic at the same moment; its result is just as good.
                db.ChangeTracker.Clear();
            }
            return ("ok", videos);
        }
        catch (YouTubeQuotaException e)
        {
            logger.LogWarning("YouTube quota reached while searching topic {TopicId}: {Reason}", topicId, e.Message);
            return ("quota_exceeded", cached);
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException or JsonException && !ct.IsCancellationRequested)
        {
            logger.LogWarning(e, "YouTube search failed for topic {TopicId}", topicId);
            return ("unavailable", cached);
        }
    }

    /// <summary>"C# Loops tutorial". The skill name is left out when the title already contains it.</summary>
    internal static string SearchQuery(string title, SkillArea skill)
    {
        var term = Skills[skill].Term;
        var clean = System.Text.RegularExpressions.Regex.Replace(title, @"\s*\(.*?\)\s*", " ").Trim();
        return clean.Contains(term, StringComparison.OrdinalIgnoreCase) ? $"{clean} tutorial" : $"{term} {clean} tutorial";
    }

    /// <summary>Drops results that are too short or long, off-stack, off-topic or near-duplicates.</summary>
    internal static IEnumerable<CachedVideo> Relevant(IEnumerable<YouTubeVideo> results, string topicTitle, SkillArea skill)
    {
        var keywords = TopicKeywords(topicTitle);
        var aliases = Skills[skill].Aliases;
        var seenTitles = new HashSet<string>();
        foreach (var v in results)
        {
            if (v.DurationSeconds is { } s && (s < MinSeconds || s > MaxSeconds)) continue;
            var title = v.Title.ToLowerInvariant();
            var tags = string.Join(' ', v.Tags).ToLowerInvariant();
            var text = $"{title} {tags} {v.Description.ToLowerInvariant()}";
            if (aliases.Length > 0 && !aliases.Any(text.Contains)) continue;
            if (keywords.Count > 0 && !keywords.Any(k => title.Contains(k) || tags.Contains(k))) continue;
            if (!seenTitles.Add(System.Text.RegularExpressions.Regex.Replace(title, "[^a-z0-9]+", " ").Trim())) continue;
            yield return new CachedVideo(v.VideoId, v.Title, v.ChannelTitle, v.PublishedAt, v.DurationSeconds);
        }
    }

    /// <summary>Words from the topic title a relevant video should mention: "Deferred execution" → deferred, execution.</summary>
    internal static List<string> TopicKeywords(string title) =>
        System.Text.RegularExpressions.Regex.Split(System.Text.RegularExpressions.Regex.Replace(title.ToLowerInvariant(), @"\(.*?\)", " "), "[^a-z0-9#+.]+")
            .Select(w => w.Trim('.'))
            .Where(w => w.Length >= 3 && !StopWords.Contains(w))
            .Select(Singular)
            .Distinct()
            .ToList();

    /// <summary>Rough singular so "Loops" also matches "for loop": classes → class, queries → query, loops → loop.</summary>
    private static string Singular(string word) =>
        word.EndsWith("sses") ? word[..^2]
        : word.EndsWith("ies") && word.Length > 4 ? word[..^3] + "y"
        : word.EndsWith('s') && !word.EndsWith("ss") && word.Length >= 4 ? word[..^1]
        : word;

    private static string Truncate(string value, int max) => value.Length <= max ? value : value[..max];
}
