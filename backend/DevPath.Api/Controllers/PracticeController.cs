using DevPath.Api.DTOs;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
[Route("api/practice")]
public class PracticeController(PracticeService practice) : ControllerBase
{
    [HttpGet]
    public Task<PracticeOverviewDto> List([FromQuery] ExerciseType? type, [FromQuery] int? topicId,
        [FromQuery] SkillArea? skill, [FromQuery] Difficulty? difficulty, [FromQuery] PracticeStatus? status,
        [FromQuery] ExerciseRunner? runner, [FromQuery] string? q, CancellationToken ct) =>
        practice.ListAsync(new PracticeFilter(type, topicId, skill, difficulty, status, runner, q), ct);

    [HttpGet("{id:int}")]
    public Task<ExerciseDetailDto> Get(int id, CancellationToken ct) => practice.GetAsync(id, ct);

    /// <summary>Save your own attempt or explanation. Required before the solution can be revealed.</summary>
    [HttpPut("{id:int}/attempt")]
    public Task<ExerciseDetailDto> SaveAttempt(int id, SaveAttemptRequest request, CancellationToken ct) =>
        practice.SaveAttemptAsync(id, request.Answer!, ct);

    /// <summary>Save the code in the exercise's editor.</summary>
    [HttpPut("{id:int}/files"), RequestSizeLimit(1_000_000)]
    public Task<ExerciseDetailDto> SaveFiles(int id, SavePracticeFilesRequest request, CancellationToken ct) =>
        practice.SaveFilesAsync(id, request.Files!, ct);

    /// <summary>Record the result of the automatic checks, which run in the learner's browser.</summary>
    [HttpPost("{id:int}/submissions"), RequestSizeLimit(1_000_000)]
    public Task<ExerciseDetailDto> Submit(int id, SubmitPracticeRequest request, CancellationToken ct) =>
        practice.SubmitAsync(id, request.Files!, request.Passed, request.Total, ct);

    [HttpPut("{id:int}/criteria")]
    public Task<ExerciseDetailDto> SaveCriteria(int id, SavePracticeCriteriaRequest request, CancellationToken ct) =>
        practice.SaveCriteriaAsync(id, request.Checked!, ct);

    [HttpPost("{id:int}/hints")]
    public Task<ExerciseDetailDto> RevealHint(int id, CancellationToken ct) => practice.RevealHintAsync(id, ct);

    [HttpPost("{id:int}/solution")]
    public Task<ExerciseDetailDto> RevealSolution(int id, CancellationToken ct) => practice.RevealSolutionAsync(id, ct);

    [HttpPut("{id:int}/status")]
    public Task<ExerciseDetailDto> SetStatus(int id, UpdatePracticeStatusRequest request, CancellationToken ct) =>
        practice.SetStatusAsync(id, request.Status!.Value, ct);
}
