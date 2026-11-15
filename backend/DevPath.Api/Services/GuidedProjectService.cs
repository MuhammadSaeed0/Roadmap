using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// The Project library: optional projects for every skill area at three levels, each with step-by-step
/// instructions and hints. The learner ticks steps off; nothing here changes roadmap progress.
/// </summary>
public class GuidedProjectService(AppDbContext db, TimeProvider clock)
{
    public async Task<IReadOnlyList<GuidedProjectSummaryDto>> ListAsync(CancellationToken ct)
    {
        var rows = await Summaries(db.GuidedProjects.AsNoTracking()).ToListAsync(ct);
        // The enums are stored as text, so the database would sort them alphabetically.
        return rows.OrderBy(p => p.Skill).ThenBy(p => p.Level).ThenBy(p => p.Id).ToList();
    }

    public async Task<GuidedProjectDetailDto> GetAsync(int id, CancellationToken ct)
    {
        var p = await db.GuidedProjects.AsNoTracking()
            .Include(x => x.Steps.OrderBy(s => s.Order)).ThenInclude(s => s.ProgressRows)
            .SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("GuidedProject", id);

        var sameSkill = (await Summaries(db.GuidedProjects.AsNoTracking().Where(x => x.Skill == p.Skill && x.Id != id)).ToListAsync(ct))
            .OrderBy(x => x.Level).ThenBy(x => x.Id).ToList();

        return new GuidedProjectDetailDto(
            p.Id, p.Key, p.Skill, p.Level, p.EstimatedHours, p.TitleEn, p.TitleAr, p.SummaryEn, p.SummaryAr, p.TechStack,
            Lines(p.GoalsEn), Lines(p.GoalsAr), Lines(p.RequirementsEn), Lines(p.RequirementsAr),
            Lines(p.AcceptanceEn), Lines(p.AcceptanceAr), Lines(p.StretchEn), Lines(p.StretchAr),
            p.Steps.Select(s =>
            {
                var done = s.ProgressRows.FirstOrDefault();
                return new GuidedStepDto(s.Id, s.Key, s.Order, s.TitleEn, s.TitleAr, s.BodyEn, s.BodyAr, s.Code, s.CodeLanguage,
                    Lines(s.HintsEn), Lines(s.HintsAr), done is not null, done?.CompletedAt);
            }).ToList(),
            sameSkill);
    }

    /// <summary>Marks a step done or not done. Idempotent: setting the state it already has changes nothing.</summary>
    public async Task SetStepAsync(int projectId, int stepId, bool done, CancellationToken ct)
    {
        if (!await db.GuidedProjectSteps.AnyAsync(s => s.Id == stepId && s.ProjectId == projectId, ct))
            throw new NotFoundException("GuidedProjectStep", stepId);

        var row = await db.GuidedStepProgress.SingleOrDefaultAsync(r => r.StepId == stepId, ct);
        if (done && row is null)
            db.GuidedStepProgress.Add(new GuidedStepProgress { StepId = stepId, CompletedAt = clock.GetUtcNow().UtcDateTime });
        else if (!done && row is not null)
            db.GuidedStepProgress.Remove(row);
        else
            return;
        await db.SaveChangesAsync(ct);
    }

    private static IQueryable<GuidedProjectSummaryDto> Summaries(IQueryable<GuidedProject> query) =>
        query.Select(p => new GuidedProjectSummaryDto(
            p.Id, p.Key, p.Skill, p.Level, p.EstimatedHours, p.TitleEn, p.TitleAr, p.SummaryEn, p.SummaryAr, p.TechStack,
            p.Steps.Count, p.Steps.Count(s => s.ProgressRows.Any())));

    private static IReadOnlyList<string> Lines(string text) =>
        text.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
