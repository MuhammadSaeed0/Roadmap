namespace DevPath.Api.Models;

/// <summary>
/// Shared YouTube suggestions for one topic, cached so the YouTube Data API is called
/// about once a month per topic instead of on every visit. Not user data: every account
/// sees the same suggestions; watched/saved flags live in VideoProgress.
/// </summary>
public class TopicVideoCache
{
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    /// <summary>The search that produced the list; a changed query invalidates the cache.</summary>
    public required string Query { get; set; }
    /// <summary>JSON array of <see cref="DevPath.Api.Services.CachedVideo"/>.</summary>
    public required string VideosJson { get; set; }
    public DateTime FetchedAt { get; set; }
}
