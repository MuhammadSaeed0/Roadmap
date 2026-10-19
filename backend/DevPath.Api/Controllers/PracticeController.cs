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
        [FromQuery] SkillArea? skill, CancellationToken ct) => practice.ListAsync(type, topicId, skill, ct);

    [HttpGet("{id:int}")]
    public Task<ExerciseDetailDto> Get(int id, CancellationToken ct) => practice.GetAsync(id, ct);

    /// <summary>Save your own attempt or explanation. Required before the solution can be revealed.</summary>
    [HttpPut("{id:int}/attempt")]
    public Task<ExerciseDetailDto> SaveAttempt(int id, SaveAttemptRequest request, CancellationToken ct) =>
        practice.SaveAttemptAsync(id, request.Answer!, ct);

    [HttpPost("{id:int}/hints")]
    public Task<ExerciseDetailDto> RevealHint(int id, CancellationToken ct) => practice.RevealHintAsync(id, ct);

    [HttpPost("{id:int}/solution")]
    public Task<ExerciseDetailDto> RevealSolution(int id, CancellationToken ct) => practice.RevealSolutionAsync(id, ct);

    [HttpPut("{id:int}/status")]
    public Task<ExerciseDetailDto> SetStatus(int id, UpdatePracticeStatusRequest request, CancellationToken ct) =>
        practice.SetStatusAsync(id, request.Status!.Value, ct);
}
