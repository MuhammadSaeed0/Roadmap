using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>YouTube videos for topics. Suggestions are shared; added videos and watched/saved flags are per account.</summary>
[ApiController]
[Route("api")]
public class VideosController(TopicVideoService videos) : ControllerBase
{
    [HttpGet("topics/{topicId:int}/videos")]
    public Task<TopicVideosDto> List(int topicId, CancellationToken ct) => videos.GetAsync(topicId, ct);

    /// <summary>Every curated video, organised by roadmap phase and topic. Language: English or Arabic (omit for both).</summary>
    [HttpGet("videos/library")]
    public Task<VideoLibraryDto> Library([FromQuery] Models.VideoLanguage? language, CancellationToken ct) =>
        videos.LibraryAsync(language, ct);

    [HttpGet("project-tasks/{taskId:int}/videos")]
    public Task<TaskVideosDto> ListForTask(int taskId, CancellationToken ct) => videos.GetForTaskAsync(taskId, ct);

    [HttpPost("topics/{topicId:int}/videos")]
    public async Task<ActionResult<TopicVideoDto>> Add(int topicId, AddTopicVideoRequest request, CancellationToken ct)
    {
        var video = await videos.AddAsync(topicId, request.Url!, ct);
        return CreatedAtAction(nameof(List), new { topicId }, video);
    }

    [HttpDelete("topic-videos/{id:int}")]
    public async Task<IActionResult> Remove(int id, CancellationToken ct)
    {
        await videos.RemoveAsync(id, ct);
        return NoContent();
    }

    [HttpPut("videos/{videoId}/progress")]
    public Task<VideoProgressDto> SetProgress(string videoId, UpdateVideoProgressRequest request, CancellationToken ct) =>
        videos.SetProgressAsync(videoId, request, ct);
}
