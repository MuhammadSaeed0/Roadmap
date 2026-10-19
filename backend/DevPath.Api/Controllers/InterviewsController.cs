using DevPath.Api.DTOs;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
[Route("api/interviews")]
public class InterviewsController(InterviewService interviews) : ControllerBase
{
    /// <param name="rating">NeedReview, Partial, Confident or "unrated".</param>
    [HttpGet]
    public Task<InterviewListDto> List([FromQuery] InterviewCategory? category, [FromQuery] int? topicId,
        [FromQuery] string? rating, CancellationToken ct) => interviews.ListAsync(category, topicId, rating, ct);

    [HttpGet("{id:int}")]
    public Task<InterviewQuestionDto> Get(int id, CancellationToken ct) => interviews.GetAsync(id, ct);

    [HttpPut("{id:int}/progress")]
    public Task<InterviewQuestionDto> Rate(int id, RateInterviewRequest request, CancellationToken ct) =>
        interviews.RateAsync(id, request.Rating!.Value, ct);
}
