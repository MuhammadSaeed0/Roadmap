public record ExplainRequest([Required, MaxLength(500)] string Question);
public record ExplainResult(string Explanation, string[] PracticeQuestions);

[ApiController, Authorize, Route("api/topics/{id:int}/explain"), EnableRateLimiting("ai")]
public sealed class ExplainController(TopicTutor tutor) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ExplainResult>> Post(int id, ExplainRequest body, CancellationToken ct)
    {
        try
        {
            return await tutor.ExplainAsync(id, body.Question, ct) is { } result
                ? result
                : Problem(statusCode: 502, title: "The assistant gave an answer we couldn't use. Try again.");
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            return Problem(statusCode: 503, title: "The assistant is busy right now. Try again in a minute.");
        }
    }
}

// Test: replace the real client with a fake in WebApplicationFactory.
// services.AddSingleton<IChatClient>(new FakeChatClient("""{"explanation":"...","practiceQuestions":["a","b","c"]}"""));
