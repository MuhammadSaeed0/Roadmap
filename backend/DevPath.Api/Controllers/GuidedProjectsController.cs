using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>The Project library: optional step-by-step projects for every skill at three levels.</summary>
[ApiController]
[Route("api/guided-projects")]
public class GuidedProjectsController(GuidedProjectService projects, TrackContext tracks) : ControllerBase
{
    [HttpGet]
    public async Task<IReadOnlyList<GuidedProjectSummaryDto>> List(CancellationToken ct, [FromQuery] bool all = false) =>
        await projects.ListAsync(ct, await tracks.TopicIdsAsync(all, ct));

    /// <summary>The unfinished project the learner touched last (204 when none).</summary>
    [HttpGet("current")]
    public async Task<ActionResult<CurrentGuidedProjectDto>> Current(CancellationToken ct) =>
        await projects.GetCurrentAsync(ct) is { } current ? current : NoContent();

    [HttpGet("{id:int}")]
    public Task<GuidedProjectDetailDto> Get(int id, CancellationToken ct) => projects.GetAsync(id, ct);

    [HttpPut("{id:int}/steps/{stepId:int}")]
    public async Task<IActionResult> SetStep(int id, int stepId, GuidedStepUpdate body, CancellationToken ct)
    {
        await projects.SetStepAsync(id, stepId, body.Done, ct);
        return NoContent();
    }

    [HttpPut("{id:int}/repository")]
    public async Task<IActionResult> SetRepository(int id, UpdateRepositoryRequest body, CancellationToken ct)
    {
        await projects.SetRepositoryAsync(id, body.RepositoryUrl, ct);
        return NoContent();
    }
}
