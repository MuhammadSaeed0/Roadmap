using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace DevPath.Api.Services;

/// <summary>YouTube settings. Keep ApiKey out of appsettings.json: <c>dotnet user-secrets set "YouTube:ApiKey" "…"</c>.</summary>
public class YouTubeOptions
{
    public const string SectionName = "YouTube";
    /// <summary>YouTube Data API v3 key. Empty = automatic suggestions are off; adding videos by link still works.</summary>
    public string? ApiKey { get; set; }
    /// <summary>How long a topic's suggestions are reused before searching again.</summary>
    public int CacheDays { get; set; } = 30;
    public int MaxVideos { get; set; } = 6;
}

/// <summary>A search result after YouTube confirmed it is public, processed and embeddable.</summary>
public record YouTubeVideo(
    string VideoId, string Title, string ChannelTitle, string Description, IReadOnlyList<string> Tags,
    DateTime? PublishedAt, int? DurationSeconds);

/// <summary>What YouTube's oEmbed endpoint says about a video link.</summary>
public enum VideoLookupStatus { Found, NotFound, NotEmbeddable, Unavailable }
public record VideoLookupResult(VideoLookupStatus Status, string? Title = null, string? ChannelTitle = null);

public class YouTubeQuotaException(string reason) : Exception($"YouTube quota or rate limit: {reason}");

public interface IYouTubeClient
{
    bool IsConfigured { get; }
    /// <summary>Searches, then confirms each result with videos.list. Throws YouTubeQuotaException or HttpRequestException.</summary>
    Task<IReadOnlyList<YouTubeVideo>> SearchAsync(string query, CancellationToken ct);
    /// <summary>Checks a single video through oEmbed (no API key needed).</summary>
    Task<VideoLookupResult> LookupAsync(string videoId, CancellationToken ct);
}

/// <summary>Calls the YouTube Data API v3 and oEmbed. Registered as a typed HttpClient.</summary>
public partial class YouTubeClient(HttpClient http, Microsoft.Extensions.Options.IOptions<YouTubeOptions> options) : IYouTubeClient
{
    private string? ApiKey => string.IsNullOrWhiteSpace(options.Value.ApiKey) ? null : options.Value.ApiKey.Trim();
    public bool IsConfigured => ApiKey is not null;

    public async Task<IReadOnlyList<YouTubeVideo>> SearchAsync(string query, CancellationToken ct)
    {
        var key = ApiKey ?? throw new InvalidOperationException("YouTube:ApiKey is not configured.");
        var found = await GetAsync<SearchResponse>("search", new()
        {
            ["part"] = "snippet", ["type"] = "video", ["q"] = query, ["maxResults"] = "20", ["videoEmbeddable"] = "true",
            ["safeSearch"] = "strict", ["relevanceLanguage"] = "en", ["order"] = "relevance",
        }, key, ct);
        var ids = found.Items.Select(i => i.Id?.VideoId).OfType<string>().Where(YouTubeIds.IsValid).Distinct().ToList();
        if (ids.Count == 0) return [];

        // search.list can return private, unprocessed or non-embeddable videos; videos.list (1 quota unit) confirms each.
        var details = await GetAsync<VideosResponse>("videos", new()
        {
            ["part"] = "snippet,contentDetails,status", ["id"] = string.Join(',', ids), ["maxResults"] = "50",
        }, key, ct);
        var byId = details.Items.ToDictionary(v => v.Id);

        return ids.Select(id => byId.GetValueOrDefault(id))
            .Where(v => v?.Snippet?.Title is not null && v.Status is { Embeddable: true, PrivacyStatus: "public", UploadStatus: "processed" })
            .Select(v => new YouTubeVideo(v!.Id, v.Snippet!.Title!, v.Snippet.ChannelTitle ?? "", v.Snippet.Description ?? "",
                v.Snippet.Tags ?? [], v.Snippet.PublishedAt, IsoDurationSeconds(v.ContentDetails?.Duration)))
            .ToList();
    }

    public async Task<VideoLookupResult> LookupAsync(string videoId, CancellationToken ct)
    {
        var watch = Uri.EscapeDataString($"https://www.youtube.com/watch?v={videoId}");
        using var response = await http.GetAsync($"https://www.youtube.com/oembed?format=json&url={watch}", ct);
        // oEmbed answers 401/403 when embedding is disabled, 400/404 when the video is missing or private.
        if (response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden) return new(VideoLookupStatus.NotEmbeddable);
        if (response.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.BadRequest) return new(VideoLookupStatus.NotFound);
        if (!response.IsSuccessStatusCode) return new(VideoLookupStatus.Unavailable);
        var data = await response.Content.ReadFromJsonAsync<OEmbedResponse>(ct);
        return string.IsNullOrWhiteSpace(data?.Title)
            ? new(VideoLookupStatus.NotFound)
            : new(VideoLookupStatus.Found, data.Title, data.AuthorName ?? "");
    }

    private async Task<T> GetAsync<T>(string resource, Dictionary<string, string> query, string key, CancellationToken ct) where T : new()
    {
        query["key"] = key;
        var url = $"https://www.googleapis.com/youtube/v3/{resource}?" +
                  string.Join('&', query.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value)}"));
        using var response = await http.GetAsync(url, ct);
        if (response.IsSuccessStatusCode) return await response.Content.ReadFromJsonAsync<T>(ct) ?? new T();

        var reason = "";
        try
        {
            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
            reason = doc.RootElement.GetProperty("error").GetProperty("errors")[0].GetProperty("reason").GetString() ?? "";
        }
        catch (Exception e) when (e is JsonException or KeyNotFoundException or InvalidOperationException or IndexOutOfRangeException) { }
        if (response.StatusCode == HttpStatusCode.Forbidden && QuotaReason().IsMatch(reason)) throw new YouTubeQuotaException(reason);
        // The message never includes the URL, which contains the API key.
        throw new HttpRequestException($"YouTube {resource} returned {(int)response.StatusCode} {reason}", null, response.StatusCode);
    }

    /// <summary>"PT1H2M3S" → 3723.</summary>
    internal static int? IsoDurationSeconds(string? value)
    {
        var m = value is null ? null : IsoDuration().Match(value);
        if (m is not { Success: true }) return null;
        int Part(int i) => m.Groups[i].Success ? int.Parse(m.Groups[i].Value) : 0;
        return Part(1) * 86400 + Part(2) * 3600 + Part(3) * 60 + Part(4);
    }

    [GeneratedRegex(@"^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$")]
    private static partial Regex IsoDuration();

    [GeneratedRegex("quota|rateLimit", RegexOptions.IgnoreCase)]
    private static partial Regex QuotaReason();

    // ----- Response shapes (only the fields we read) -----
    private class SearchResponse { public List<SearchItem> Items { get; set; } = []; }
    private class SearchItem { public SearchId? Id { get; set; } }
    private class SearchId { public string? VideoId { get; set; } }
    private class VideosResponse { public List<VideoItem> Items { get; set; } = []; }
    private class VideoItem
    {
        public string Id { get; set; } = "";
        public VideoSnippet? Snippet { get; set; }
        public VideoContentDetails? ContentDetails { get; set; }
        public VideoStatus? Status { get; set; }
    }
    private class VideoSnippet
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ChannelTitle { get; set; }
        public DateTime? PublishedAt { get; set; }
        public List<string>? Tags { get; set; }
    }
    private class VideoContentDetails { public string? Duration { get; set; } }
    private class VideoStatus
    {
        public bool Embeddable { get; set; }
        public string? PrivacyStatus { get; set; }
        public string? UploadStatus { get; set; }
    }
    private class OEmbedResponse
    {
        public string? Title { get; set; }
        [JsonPropertyName("author_name")] public string? AuthorName { get; set; }
    }
}

/// <summary>YouTube video ids and links. Only ids matching this format are stored or embedded.</summary>
public static partial class YouTubeIds
{
    public static bool IsValid(string? id) => id is not null && VideoId().IsMatch(id);

    /// <summary>Accepts watch, youtu.be, shorts, embed and live links; returns null for anything else.</summary>
    public static string? Parse(string? input)
    {
        if (!Uri.TryCreate(input?.Trim(), UriKind.Absolute, out var url) || url.Scheme is not ("https" or "http")) return null;
        var host = Regex.Replace(url.Host.ToLowerInvariant(), "^(www|m|music)\\.", "");
        string? id = null;
        if (host == "youtu.be") id = url.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        else if (host is "youtube.com" or "youtube-nocookie.com")
        {
            if (url.AbsolutePath == "/watch")
                id = Microsoft.AspNetCore.WebUtilities.QueryHelpers.ParseQuery(url.Query).TryGetValue("v", out var v) ? v.ToString() : null;
            else
            {
                var m = PathId().Match(url.AbsolutePath);
                id = m.Success ? m.Groups[1].Value : null;
            }
        }
        return IsValid(id) ? id : null;
    }

    [GeneratedRegex("^[A-Za-z0-9_-]{11}$")]
    private static partial Regex VideoId();

    [GeneratedRegex("^/(?:embed|shorts|live|v)/([^/?#]+)")]
    private static partial Regex PathId();
}
