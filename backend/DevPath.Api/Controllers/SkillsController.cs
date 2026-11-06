using DevPath.Api.DTOs;
using DevPath.Api.Services.Skills;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>Developer level: XP, competency scores, skill profile, next-level requirements and project reviews.</summary>
[ApiController]
[Route("api")]
public class SkillsController(SkillAssessmentService skills) : ControllerBase
{
    /// <summary>The learner's level and everything behind it. Also brings the XP ledger up to date.</summary>
    [HttpGet("skill-level")]
    public Task<SkillLevelDto> Get(CancellationToken ct) => skills.GetAsync(ct);

    /// <summary>Every change to the learner's points, newest first.</summary>
    [HttpGet("skill-level/history")]
    public Task<PagedXpDto> History([FromQuery] int page = 1, [FromQuery] int pageSize = 25, CancellationToken ct = default) =>
        skills.GetHistoryAsync(page, pageSize, ct);

    /// <summary>The scoring rules in force (SeedData/skill-assessment.json).</summary>
    [HttpGet("skill-level/rules")]
    public SkillRulesDto Rules() => skills.GetRules();

    [HttpGet("projects/{id:int}/assessment")]
    public Task<ProjectAssessmentDto> GetAssessment(int id, CancellationToken ct) => skills.GetProjectAssessmentAsync(id, ct);

    [HttpPut("projects/{id:int}/assessment")]
    public Task<ProjectAssessmentDto> SaveAssessment(int id, SaveProjectAssessmentRequest request, CancellationToken ct) =>
        skills.SaveProjectAssessmentAsync(id, request, ct);
}
