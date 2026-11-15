using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>The Project library: optional step-by-step projects for every skill at three levels.</summary>
[ApiController]
[Route("api/guided-projects")]
public class GuidedProjectsController(GuidedProjectService projects) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<GuidedProjectSummaryDto>> List(CancellationToken ct) => projects.ListAsync(ct);

    [HttpGet("{id:int}")]
    public Task<GuidedProjectDetailDto> Get(int id, CancellationToken ct) => projects.GetAsync(id, ct);

    [HttpPut("{id:int}/steps/{stepId:int}")]
    public async Task<IActionResult> SetStep(int id, int stepId, GuidedStepUpdate body, CancellationToken ct)
    {
        await projects.SetStepAsync(id, stepId, body.Done, ct);
        return NoContent();
    }
}
