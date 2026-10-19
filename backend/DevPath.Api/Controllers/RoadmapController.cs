using DevPath.Api.DTOs;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
[Route("api")]
public class RoadmapController(TopicService topics, RecommendationService recommendations, StudyPlanService plans) : ControllerBase
{
    /// <summary>All phases with their topics and your progress.</summary>
    [HttpGet("roadmap")]
    public Task<RoadmapDto> GetRoadmap(CancellationToken ct) => topics.GetRoadmapAsync(ct);

    /// <summary>Filterable, paged topic list.</summary>
    [HttpGet("topics")]
    public Task<PagedResult<TopicSummaryDto>> GetTopics(
        [FromQuery] string? q, [FromQuery] SkillArea? skill, [FromQuery] TopicStatus? status,
        [FromQuery] int? phaseId, [FromQuery] TopicPriority? priority, [FromQuery] KnowledgeLevel? knowledge,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default) =>
        topics.SearchAsync(new TopicQuery(q, skill, status, phaseId, priority, knowledge, page, pageSize), ct);

    [HttpGet("topics/{id:int}")]
    public Task<TopicDetailDto> GetTopic(int id, CancellationToken ct) => topics.GetDetailAsync(id, ct);

    [HttpPut("topics/{id:int}/progress")]
    public Task<TopicProgressDto> UpdateProgress(int id, UpdateTopicProgressRequest request, CancellationToken ct) =>
        topics.UpdateProgressAsync(id, request, ct);

    /// <summary>What should I study next? Ranked topics, each with the reasons behind its score.</summary>
    [HttpGet("recommendations")]
    public Task<IReadOnlyList<RecommendationDto>> GetRecommendations(
        [FromQuery] int? minutes, [FromQuery] int take = 3, CancellationToken ct = default) =>
        recommendations.GetAsync(minutes, take, ct);

    /// <summary>A study plan for the time you have today (15 to 240 minutes).</summary>
    [HttpGet("study-plan")]
    public async Task<ActionResult<StudyPlanDto>> GetStudyPlan([FromQuery] int minutes = 60, CancellationToken ct = default)
    {
        if (minutes is < 15 or > 240)
        {
            ModelState.AddModelError(nameof(minutes), "Minutes must be between 15 and 240.");
            return ValidationProblem(ModelState);
        }
        return await plans.BuildAsync(minutes, ct);
    }
}
