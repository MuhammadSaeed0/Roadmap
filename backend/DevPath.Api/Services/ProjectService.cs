using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

public class ProjectService(AppDbContext db, TimeProvider clock)
{
    // Loaded once per request; four projects with ~100 tasks is tiny.
    private async Task<List<Project>> LoadProjectsAsync(CancellationToken ct, int? projectId = null) =>
        await db.Projects.AsNoTracking()
            .Where(p => projectId == null || p.Id == projectId)
            .Include(p => p.StartAfterPhase)
            .Include(p => p.PortfolioChecks)
            .Include(p => p.Repositories)
            .Include(p => p.Milestones.OrderBy(m => m.Order))
                .ThenInclude(m => m.Tasks.OrderBy(t => t.Order))
                    .ThenInclude(t => t.ProgressRows)
            .Include(p => p.Milestones)
                .ThenInclude(m => m.Tasks)
                    .ThenInclude(t => t.TopicLinks)
                        .ThenInclude(l => l.Topic)
                            .ThenInclude(t => t.ProgressRows)
            .AsSplitQuery()
            .OrderBy(p => p.Order)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<ProjectSummaryDto>> GetSummariesAsync(CancellationToken ct)
    {
        var projects = await LoadProjectsAsync(ct);
        var checklistTotal = await db.PortfolioChecklistItems.CountAsync(ct);
        return projects.Select(p => Summarize(p, checklistTotal)).ToList();
    }

    public async Task<ProjectDetailDto> GetDetailAsync(int id, CancellationToken ct)
    {
        var project = (await LoadProjectsAsync(ct, id)).SingleOrDefault()
            ?? throw new NotFoundException("Project", id);

        var checklist = await db.PortfolioChecklistItems.AsNoTracking().OrderBy(i => i.Order).ToListAsync(ct);
        var summary = Summarize(project, checklist.Count);
        var noteCount = await db.Notes.CountAsync(n => n.ProjectId == id ||
            (n.ProjectTask != null && n.ProjectTask.Milestone.ProjectId == id), ct);

        var milestones = project.Milestones
            .Select(m =>
            {
                var tasks = m.Tasks.Where(t => !t.IsChangeRequest).Select(t => ToDto(t, summary.Percent)).ToList();
                return new MilestoneDto(m.Id, m.Order, m.TitleEn, m.TitleAr, m.DescriptionEn, m.DescriptionAr,
                    tasks.Count, tasks.Count(t => t.Status == ProjectTaskStatus.Completed), tasks);
            })
            .Where(m => m.TotalTasks > 0)
            .ToList();

        var changeRequests = project.Milestones.SelectMany(m => m.Tasks)
            .Where(t => t.IsChangeRequest)
            .OrderBy(t => t.UnlockAtPercent).ThenBy(t => t.Order)
            .Select(t => ToDto(t, summary.Percent))
            .ToList();

        var done = project.PortfolioChecks.Where(c => c.IsDone).Select(c => c.ChecklistItemId).ToHashSet();
        var portfolio = checklist
            .Select(i => new PortfolioItemDto(i.Id, i.Key, i.TitleEn, i.TitleAr, i.DescriptionEn, i.DescriptionAr, done.Contains(i.Id)))
            .ToList();

        return new ProjectDetailDto(summary, SplitLines(project.RequirementsEn), SplitLines(project.RequirementsAr),
            project.Repositories.FirstOrDefault()?.RepositoryUrl, milestones, changeRequests, portfolio, noteCount);
    }

    public async Task<IReadOnlyList<ProjectTaskDto>> GetTasksAsync(int projectId, CancellationToken ct)
    {
        var detail = await GetDetailAsync(projectId, ct);
        return detail.Milestones.SelectMany(m => m.Tasks).Concat(detail.ChangeRequests).ToList();
    }

    /// <summary>
    /// Business rules for task status:
    /// * A locked change request can't be worked on yet.
    /// * "Blocked" needs a short reason so you remember what you were waiting for.
    /// * CompletedAt is set when completing and cleared when re-opening.
    /// </summary>
    public async Task<ProjectTaskDto> UpdateTaskProgressAsync(int taskId, UpdateProjectTaskProgressRequest request, CancellationToken ct)
    {
        var task = await db.ProjectTasks
            .Include(t => t.ProgressRows)
            .Include(t => t.Milestone)
            .SingleOrDefaultAsync(t => t.Id == taskId, ct)
            ?? throw new NotFoundException("ProjectTask", taskId);

        var status = request.Status!.Value;
        if (task.IsChangeRequest && status != ProjectTaskStatus.NotStarted)
        {
            var percent = await ProjectPercentAsync(task.Milestone.ProjectId, ct);
            if (percent < task.UnlockAtPercent)
                throw new BusinessRuleException("task_locked",
                    $"This change request unlocks when the project reaches {task.UnlockAtPercent}%.");
        }

        var reason = request.BlockedReason?.Trim();
        if (status == ProjectTaskStatus.Blocked && string.IsNullOrEmpty(reason))
            throw new RequestValidationException("blockedReason", "required", "Please describe what is blocking this task.");

        var now = clock.GetUtcNow().UtcDateTime;
        // ProgressRows was loaded with the query filter: at most the signed-in user's row.
        var progress = task.ProgressRows.FirstOrDefault();
        if (progress is null)
        {
            progress = new ProjectTaskProgress { ProjectTaskId = task.Id };
            task.ProgressRows.Add(progress);
        }
        progress.Status = status;
        progress.BlockedReason = status == ProjectTaskStatus.Blocked ? reason : null;
        if (status is ProjectTaskStatus.InProgress or ProjectTaskStatus.Completed) progress.StartedAt ??= now;
        progress.CompletedAt = status == ProjectTaskStatus.Completed ? progress.CompletedAt ?? now : null;
        if (status == ProjectTaskStatus.NotStarted) progress.StartedAt = null;
        progress.UpdatedAt = now;

        await db.SaveChangesAsync(ct);

        var tasks = await GetTasksAsync(task.Milestone.ProjectId, ct);
        return tasks.Single(t => t.Id == taskId);
    }

    public async Task<PortfolioItemDto> SetPortfolioCheckAsync(int projectId, int itemId, bool isDone, CancellationToken ct)
    {
        if (!await db.Projects.AnyAsync(p => p.Id == projectId, ct)) throw new NotFoundException("Project", projectId);
        var item = await db.PortfolioChecklistItems.AsNoTracking().SingleOrDefaultAsync(i => i.Id == itemId, ct)
            ?? throw new NotFoundException("PortfolioChecklistItem", itemId);

        var check = await db.PortfolioChecks.SingleOrDefaultAsync(c => c.ProjectId == projectId && c.ChecklistItemId == itemId, ct);
        if (check is null)
        {
            check = new PortfolioCheck { ProjectId = projectId, ChecklistItemId = itemId };
            db.PortfolioChecks.Add(check);
        }
        check.IsDone = isDone;
        check.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);

        return new PortfolioItemDto(item.Id, item.Key, item.TitleEn, item.TitleAr, item.DescriptionEn, item.DescriptionAr, isDone);
    }

    public async Task SetRepositoryUrlAsync(int projectId, string? url, CancellationToken ct)
    {
        if (!await db.Projects.AnyAsync(p => p.Id == projectId, ct)) throw new NotFoundException("Project", projectId);
        var repository = await db.ProjectRepositories.SingleOrDefaultAsync(r => r.ProjectId == projectId, ct);
        if (string.IsNullOrWhiteSpace(url))
        {
            if (repository is not null) db.ProjectRepositories.Remove(repository);
        }
        else if (repository is null)
        {
            db.ProjectRepositories.Add(new ProjectRepository { ProjectId = projectId, RepositoryUrl = url.Trim(), UpdatedAt = clock.GetUtcNow().UtcDateTime });
        }
        else
        {
            repository.RepositoryUrl = url.Trim();
            repository.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        }
        await db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Topics needed by unfinished tasks of the projects you're working on (or the next one).
    /// Feeds the recommendation engine.
    /// </summary>
    public async Task<IReadOnlyDictionary<int, ProjectNeed>> GetProjectNeedsAsync(CancellationToken ct)
    {
        var projects = await LoadProjectsAsync(ct);
        var summaries = projects.ToDictionary(p => p.Id, p => Summarize(p, 0));
        var focus = projects.Where(p => summaries[p.Id].Status == "active").ToList();
        var next = projects.FirstOrDefault(p => summaries[p.Id].Status == "notStarted");
        if (next is not null) focus.Add(next);

        var needs = new Dictionary<int, ProjectNeed>();
        foreach (var p in focus.OrderBy(p => p.Order))
        {
            var percent = summaries[p.Id].Percent;
            foreach (var task in p.Milestones.SelectMany(m => m.Tasks)
                         .Where(t => (t.ProgressRows.FirstOrDefault()?.Status ?? ProjectTaskStatus.NotStarted) != ProjectTaskStatus.Completed)
                         .Where(t => !t.IsChangeRequest || percent >= t.UnlockAtPercent))
            {
                foreach (var link in task.TopicLinks)
                    needs.TryAdd(link.TopicId, new ProjectNeed(p.Id, p.TitleEn, p.TitleAr));
            }
        }
        return needs;
    }

    /// <summary>The next unfinished, unlocked task in the first active (or next) project.</summary>
    public async Task<(ProjectTask Task, Project Project)?> GetNextTaskAsync(CancellationToken ct)
    {
        var projects = await LoadProjectsAsync(ct);
        var ordered = projects
            .Select(p => (Project: p, Summary: Summarize(p, 0)))
            .Where(x => x.Summary.Status != "completed")
            .OrderBy(x => x.Summary.Status == "active" ? 0 : 1).ThenBy(x => x.Project.Order);

        foreach (var (project, summary) in ordered)
        {
            var task = project.Milestones.OrderBy(m => m.Order).SelectMany(m => m.Tasks.OrderBy(t => t.Order))
                .Where(t => !t.IsChangeRequest || summary.Percent >= t.UnlockAtPercent)
                .FirstOrDefault(t => (t.ProgressRows.FirstOrDefault()?.Status ?? ProjectTaskStatus.NotStarted)
                    is ProjectTaskStatus.NotStarted or ProjectTaskStatus.InProgress);
            if (task is not null) return (task, project);
        }
        return null;
    }

    private async Task<double> ProjectPercentAsync(int projectId, CancellationToken ct)
    {
        var tasks = await db.ProjectTasks.AsNoTracking()
            .Where(t => t.Milestone.ProjectId == projectId && !t.IsChangeRequest)
            .Select(t => t.ProgressRows.Any(p => p.Status == ProjectTaskStatus.Completed))
            .ToListAsync(ct);
        return tasks.Count == 0 ? 0 : Math.Round(tasks.Count(done => done) * 100.0 / tasks.Count, 1);
    }

    public static ProjectSummaryDto Summarize(Project p, int checklistTotal)
    {
        var all = p.Milestones.SelectMany(m => m.Tasks).ToList();
        var core = all.Where(t => !t.IsChangeRequest).ToList();
        ProjectTaskStatus StatusOf(ProjectTask t) => t.ProgressRows.FirstOrDefault()?.Status ?? ProjectTaskStatus.NotStarted;

        var completed = core.Count(t => StatusOf(t) == ProjectTaskStatus.Completed);
        var percent = core.Count == 0 ? 0 : Math.Round(completed * 100.0 / core.Count, 1);
        var touched = all.Any(t => StatusOf(t) != ProjectTaskStatus.NotStarted);
        var status = percent >= 100 ? "completed" : touched ? "active" : "notStarted";

        var currentMilestone = p.Milestones.OrderBy(m => m.Order)
            .FirstOrDefault(m => m.Tasks.Any(t => !t.IsChangeRequest && StatusOf(t) != ProjectTaskStatus.Completed));
        var crs = all.Where(t => t.IsChangeRequest).ToList();

        return new ProjectSummaryDto(
            p.Id, p.Slug, p.Order, p.TitleEn, p.TitleAr, p.SummaryEn, p.SummaryAr, p.TechStack,
            ProgressCalculator.ToRef(new PhaseState(p.StartAfterPhase.Id, p.StartAfterPhase.Slug, p.StartAfterPhase.Order,
                p.StartAfterPhase.TitleEn, p.StartAfterPhase.TitleAr)),
            core.Count, completed,
            core.Count(t => StatusOf(t) == ProjectTaskStatus.InProgress),
            core.Count(t => StatusOf(t) == ProjectTaskStatus.Blocked),
            percent, status, currentMilestone?.TitleEn, currentMilestone?.TitleAr,
            crs.Count(t => percent >= t.UnlockAtPercent),
            crs.Count(t => StatusOf(t) == ProjectTaskStatus.Completed),
            p.PortfolioChecks.Count(c => c.IsDone), checklistTotal);
    }

    private static ProjectTaskDto ToDto(ProjectTask t, double projectPercent) => new(
        t.Id, t.Key, t.MilestoneId, t.Order, t.TitleEn, t.TitleAr, t.DescriptionEn, t.DescriptionAr,
        SplitLines(t.AcceptanceCriteriaEn), SplitLines(t.AcceptanceCriteriaAr),
        t.EstimatedMinutes, t.Priority, t.IsChangeRequest, t.UnlockAtPercent,
        IsLocked: t.IsChangeRequest && projectPercent < t.UnlockAtPercent,
        t.ProgressRows.FirstOrDefault()?.Status ?? ProjectTaskStatus.NotStarted, t.ProgressRows.FirstOrDefault()?.BlockedReason, t.ProgressRows.FirstOrDefault()?.CompletedAt,
        t.TopicLinks.Select(l => new TopicRefDto(l.Topic.Id, l.Topic.Slug, l.Topic.TitleEn, l.Topic.TitleAr, l.Topic.Skill,
            l.Topic.ProgressRows.FirstOrDefault()?.Status ?? TopicStatus.NotStarted)).OrderBy(x => x.Id).ToList());

    internal static IReadOnlyList<string> SplitLines(string text) =>
        text.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
