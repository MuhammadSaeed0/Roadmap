using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController(ReviewService reviews) : ControllerBase
{
    [HttpGet]
    public Task<ReviewQueueDto> GetQueue(CancellationToken ct) => reviews.GetQueueAsync(ct);

    /// <summary>Add a topic to the review queue. PUT because adding twice has the same effect (idempotent).</summary>
    [HttpPut("{topicId:int}")]
    public Task<ReviewStateDto> Add(int topicId, CancellationToken ct) => reviews.AddAsync(topicId, ct);

    /// <summary>Flashcards for a quick review of one topic, built from its quiz questions and objectives. Changes nothing.</summary>
    [HttpGet("{topicId:int}/cards")]
    public Task<FlashcardDeckDto> Cards(int topicId, CancellationToken ct) => reviews.CardsAsync(topicId, ct);

    [HttpPost("{topicId:int}/complete")]
    public Task<ReviewStateDto> Complete(int topicId, CompleteReviewRequest request, CancellationToken ct) =>
        reviews.CompleteAsync(topicId, request.Confidence!.Value, ct);

    [HttpDelete("{topicId:int}")]
    public async Task<IActionResult> Remove(int topicId, CancellationToken ct)
    {
        await reviews.RemoveAsync(topicId, ct);
        return NoContent();
    }
}
