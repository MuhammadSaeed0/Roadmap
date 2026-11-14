using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
public class PeerReviewsController(PeerReviewService reviews) : ControllerBase
{
    /// <summary>Open requests I can review, my requests, and the reviews I'm doing, plus the rubric's criteria.</summary>
    [HttpGet("api/review-requests")]
    public Task<ReviewRequestListsDto> List(CancellationToken ct) => reviews.ListAsync(ct);

    [HttpGet("api/projects/{projectId:int}/review-request")]
    public async Task<ActionResult<ReviewRequestDto>> Latest(int projectId, CancellationToken ct) =>
        await reviews.LatestForProjectAsync(projectId, ct) is { } r ? r : NoContent();

    [HttpPost("api/projects/{projectId:int}/review-request")]
    public Task<ReviewRequestDto> RequestReview(int projectId, CancellationToken ct) => reviews.RequestAsync(projectId, ct);

    [HttpPost("api/review-requests/{id:int}/claim")]
    public Task<ReviewRequestDto> Claim(int id, CancellationToken ct) => reviews.ClaimAsync(id, ct);

    [HttpPost("api/review-requests/{id:int}/release")]
    public Task<ReviewRequestDto> Release(int id, CancellationToken ct) => reviews.ReleaseAsync(id, ct);

    [HttpPut("api/review-requests/{id:int}/review")]
    public Task<ReviewRequestDto> Submit(int id, SubmitReviewRequest body, CancellationToken ct) => reviews.SubmitAsync(id, body, ct);

    [HttpDelete("api/review-requests/{id:int}")]
    public async Task<IActionResult> Cancel(int id, CancellationToken ct)
    {
        await reviews.CancelAsync(id, ct);
        return NoContent();
    }
}
