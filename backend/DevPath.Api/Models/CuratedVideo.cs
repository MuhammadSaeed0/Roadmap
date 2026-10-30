namespace DevPath.Api.Models;

/// <summary>
/// A hand-picked YouTube tutorial for a topic, seeded from SeedData/videos.json (content,
/// shared by everyone). Every entry was checked with YouTube: it exists, is public and
/// allows embedding. These are the topic's suggestions when no YouTube API key is set.
/// </summary>
public class CuratedVideo
{
    public int Id { get; set; }
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    /// <summary>YouTube's 11-character video id.</summary>
    public required string VideoId { get; set; }
    public required string Title { get; set; }
    public string ChannelTitle { get; set; } = "";
    /// <summary>The language the video is spoken in (checked by hand, not guessed from the title).</summary>
    public VideoLanguage Language { get; set; }
    /// <summary>Length as reported by YouTube, when known.</summary>
    public int? DurationSeconds { get; set; }
    /// <summary>A one-line summary of what the video covers.</summary>
    public string Description { get; set; } = "";
    public int Order { get; set; }
}
