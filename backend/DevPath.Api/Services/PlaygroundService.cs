using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Saved Code Playground workspaces. Each account sees only its own projects (query filter on UserId).
/// The server only stores files; the code runs in the learner's browser.
/// </summary>
public class PlaygroundService(AppDbContext db, TimeProvider clock)
{
    public const int MaxProjectsPerUser = 100;

    public async Task<IReadOnlyList<PlaygroundProjectSummaryDto>> ListAsync(CancellationToken ct) =>
        await db.PlaygroundProjects.AsNoTracking()
            .OrderByDescending(p => p.UpdatedAt)
            .Select(p => new PlaygroundProjectSummaryDto(p.Id, p.Name, p.Kind, p.Template, p.FileCount, p.SizeBytes, p.CreatedAt, p.UpdatedAt))
            .ToListAsync(ct);

    public async Task<PlaygroundProjectDto> GetAsync(int id, CancellationToken ct) =>
        ToDto(await db.PlaygroundProjects.AsNoTracking().SingleOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException("PlaygroundProject", id));

    public async Task<PlaygroundProjectDto> CreateAsync(CreatePlaygroundProjectRequest request, CancellationToken ct)
    {
        if (await db.PlaygroundProjects.CountAsync(ct) >= MaxProjectsPerUser)
            throw new BusinessRuleException("too_many_projects", $"You can keep up to {MaxProjectsPerUser} projects. Delete one to make room.");
        var files = WorkspaceFiles.Validate(request.Files);
        var now = clock.GetUtcNow().UtcDateTime;
        var project = new PlaygroundProject
        {
            Name = request.Name!.Trim(),
            Kind = request.Kind!.Value,
            Template = request.Template,
            Files = WorkspaceFiles.Serialize(files),
            FileCount = files.Count,
            SizeBytes = WorkspaceFiles.Size(files),
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.PlaygroundProjects.Add(project);
        await db.SaveChangesAsync(ct);
        return ToDto(project);
    }

    public async Task<PlaygroundProjectDto> UpdateAsync(int id, UpdatePlaygroundProjectRequest request, CancellationToken ct)
    {
        var project = await db.PlaygroundProjects.SingleOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException("PlaygroundProject", id);
        if (request.Name is not null) project.Name = request.Name.Trim();
        if (request.Files is not null)
        {
            var files = WorkspaceFiles.Validate(request.Files);
            project.Files = WorkspaceFiles.Serialize(files);
            project.FileCount = files.Count;
            project.SizeBytes = WorkspaceFiles.Size(files);
        }
        project.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return ToDto(project);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var project = await db.PlaygroundProjects.SingleOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException("PlaygroundProject", id);
        db.PlaygroundProjects.Remove(project);
        await db.SaveChangesAsync(ct);
    }

    private static PlaygroundProjectDto ToDto(PlaygroundProject p) => new(
        new PlaygroundProjectSummaryDto(p.Id, p.Name, p.Kind, p.Template, p.FileCount, p.SizeBytes, p.CreatedAt, p.UpdatedAt),
        WorkspaceFiles.Deserialize(p.Files) ?? []);
}
