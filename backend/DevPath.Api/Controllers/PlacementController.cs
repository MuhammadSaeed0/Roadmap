using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>
/// The optional placement check for new learners: a short quiz over the first phases, graded here,
/// and a separate request that marks only the phases the learner then confirms.
/// </summary>
[ApiController]
[Route("api/placement")]
public class PlacementController(PlacementService placement) : ControllerBase
{
    [HttpGet]
    public Task<PlacementQuizDto> Get(CancellationToken ct) => placement.GetAsync(ct);

    /// <summary>Grades the answers per phase. Changes nothing.</summary>
    [HttpPost("grade")]
    public Task<PlacementResultDto> Grade(SubmitPlacementRequest request, CancellationToken ct) => placement.GradeAsync(request, ct);

    /// <summary>Marks every topic of the chosen phases as already known, for the signed-in learner only.</summary>
    [HttpPost("apply")]
    public Task<ApplyPlacementResultDto> Apply(ApplyPlacementRequest request, CancellationToken ct) => placement.ApplyAsync(request, ct);
}
