using DevPath.Api.DTOs;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>Dashboard, progress, readiness, search, resources and preferences.</summary>
[ApiController]
[Route("api")]
public class InsightsController(
    DashboardService dashboard, AnalyticsService analytics, CareerReadinessService readiness,
    SearchService search, ResourceService resources, PreferenceService preferences) : ControllerBase
{
    [HttpGet("dashboard")]
    public Task<DashboardDto> GetDashboard(CancellationToken ct) => dashboard.GetAsync(ct);

    [HttpGet("progress")]
    public Task<ProgressReportDto> GetProgress(CancellationToken ct) => analytics.GetReportAsync(ct);

    /// <param name="weekOf">Any date in the week to review; defaults to the current week.</param>
    [HttpGet("progress/weekly")]
    public Task<WeeklyReviewDto> GetWeekly([FromQuery] DateOnly? weekOf, CancellationToken ct) => analytics.GetWeeklyAsync(weekOf, ct);

    [HttpGet("career-readiness")]
    public Task<CareerReadinessDto> GetCareerReadiness(CancellationToken ct) => readiness.GetAsync(ct);

    [HttpGet("search")]
    public async Task<ActionResult<SearchResultDto>> Search([FromQuery] string? q, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
        {
            ModelState.AddModelError(nameof(q), "Type at least 2 characters.");
            return ValidationProblem(ModelState);
        }
        return await search.SearchAsync(q.Length > 100 ? q[..100] : q, ct);
    }

    [HttpGet("resources")]
    public Task<IReadOnlyList<ResourceDto>> GetResources([FromQuery] int? topicId, [FromQuery] ResourceType? type,
        [FromQuery] SkillArea? skill, [FromQuery] string? q, CancellationToken ct) =>
        resources.ListAsync(topicId, type, skill, q, ct);

    /// <summary>Checks every resource link over the internet and records the result.</summary>
    [HttpPost("resources/verify")]
    public Task<LinkCheckResultDto> VerifyResources(CancellationToken ct) => resources.VerifyAllAsync(ct);

    [HttpGet("preferences")]
    public Task<PreferencesDto> GetPreferences(CancellationToken ct) => preferences.GetAsync(ct);

    [HttpPut("preferences")]
    public Task<PreferencesDto> UpdatePreferences(UpdatePreferencesRequest request, CancellationToken ct) =>
        preferences.UpdateAsync(request, ct);
}
