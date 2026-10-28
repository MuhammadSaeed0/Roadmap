using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>Topic quizzes. Questions are shared content; attempts and scores are per account.</summary>
[ApiController]
[Route("api/topics/{topicId:int}/quiz")]
public class QuizzesController(QuizService quizzes) : ControllerBase
{
    [HttpGet]
    public Task<QuizDto> Get(int topicId, [FromQuery] int level = 1, CancellationToken ct = default) =>
        quizzes.GetAsync(topicId, level, ct);

    [HttpPost]
    public Task<QuizResultDto> Submit(int topicId, SubmitQuizRequest request, CancellationToken ct) =>
        quizzes.SubmitAsync(topicId, request, ct);
}
