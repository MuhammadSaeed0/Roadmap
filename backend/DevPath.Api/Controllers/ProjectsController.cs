using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
[Route("api")]
public class ProjectsController(ProjectService projects) : ControllerBase
{
    [HttpGet("projects")]
    public Task<IReadOnlyList<ProjectSummaryDto>> GetProjects(CancellationToken ct) => projects.GetSummariesAsync(ct);

    [HttpGet("projects/{id:int}")]
    public Task<ProjectDetailDto> GetProject(int id, CancellationToken ct) => projects.GetDetailAsync(id, ct);

    [HttpGet("projects/{id:int}/tasks")]
    public Task<IReadOnlyList<ProjectTaskDto>> GetTasks(int id, CancellationToken ct) => projects.GetTasksAsync(id, ct);

    [HttpPut("projects/{id:int}/repository")]
    public async Task<IActionResult> SetRepository(int id, UpdateRepositoryRequest request, CancellationToken ct)
    {
        await projects.SetRepositoryUrlAsync(id, request.RepositoryUrl, ct);
        return NoContent();
    }

    [HttpPut("projects/{id:int}/portfolio/{itemId:int}")]
    public Task<PortfolioItemDto> SetPortfolioCheck(int id, int itemId, UpdatePortfolioCheckRequest request, CancellationToken ct) =>
        projects.SetPortfolioCheckAsync(id, itemId, request.IsDone!.Value, ct);

    [HttpPut("project-tasks/{id:int}/progress")]
    public Task<ProjectTaskDto> UpdateTaskProgress(int id, UpdateProjectTaskProgressRequest request, CancellationToken ct) =>
        projects.UpdateTaskProgressAsync(id, request, ct);
}
