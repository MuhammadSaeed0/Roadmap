using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Practice workflow: read the problem → write your attempt → reveal hints one at a
/// time → reveal the solution (only after an attempt is saved) → mark completed.
/// The API enforces this order, so the solution is never sent before you've tried.
/// </summary>
public class PracticeService(AppDbContext db, TimeProvider clock)
{
    public async Task<PracticeOverviewDto> ListAsync(ExerciseType? type, int? topicId, SkillArea? skill, CancellationToken ct)
    {
        var all = await db.PracticeExercises.AsNoTracking()
            .OrderBy(e => e.Topic.Phase.Order).ThenBy(e => e.Topic.Order).ThenBy(e => e.Id)
            .Select(e => new
            {
                e.Topic.Skill,
                Dto = new ExerciseSummaryDto(e.Id, e.Key, e.Type, e.TopicId, e.Topic.TitleEn, e.Topic.TitleAr,
                    e.Difficulty, e.EstimatedMinutes, e.TitleEn, e.TitleAr,
                    e.ProgressRows.Select(p => (PracticeStatus?)p.Status).FirstOrDefault() ?? PracticeStatus.NotStarted)
            })
            .ToListAsync(ct);

        var stats = Enum.GetValues<ExerciseType>()
            .Select(t => new PracticeTypeStatsDto(t,
                all.Count(e => e.Dto.Type == t),
                all.Count(e => e.Dto.Type == t && e.Dto.Status == PracticeStatus.Completed),
                all.Count(e => e.Dto.Type == t && e.Dto.Status == PracticeStatus.Attempted)))
            .ToList();

        var filtered = all
            .Where(e => type == null || e.Dto.Type == type)
            .Where(e => topicId == null || e.Dto.TopicId == topicId)
            .Where(e => skill == null || e.Skill == skill)
            .Select(e => e.Dto)
            .ToList();

        return new PracticeOverviewDto(filtered, stats);
    }

    public async Task<ExerciseDetailDto> GetAsync(int id, CancellationToken ct)
    {
        var e = await LoadAsync(id, ct, tracking: false);
        return ToDetail(e);
    }

    public async Task<ExerciseDetailDto> SaveAttemptAsync(int id, string answer, CancellationToken ct)
    {
        var e = await LoadAsync(id, ct);
        var p = EnsureProgress(e);
        p.UserAnswer = answer.Trim();
        if (p.Status == PracticeStatus.NotStarted) p.Status = PracticeStatus.Attempted;
        await db.SaveChangesAsync(ct);
        return ToDetail(e);
    }

    public async Task<ExerciseDetailDto> RevealHintAsync(int id, CancellationToken ct)
    {
        var e = await LoadAsync(id, ct);
        var hintCount = ProjectService.SplitLines(e.HintsEn).Count;
        var p = EnsureProgress(e);
        if (p.HintsRevealed >= hintCount)
            throw new BusinessRuleException("no_more_hints", "All hints have already been revealed.");
        p.HintsRevealed++;
        if (p.Status == PracticeStatus.NotStarted) p.Status = PracticeStatus.Attempted;
        await db.SaveChangesAsync(ct);
        return ToDetail(e);
    }

    public async Task<ExerciseDetailDto> RevealSolutionAsync(int id, CancellationToken ct)
    {
        var e = await LoadAsync(id, ct);
        if (string.IsNullOrWhiteSpace(e.ProgressRows.FirstOrDefault()?.UserAnswer))
            throw new BusinessRuleException("attempt_required",
                "Write and save your own attempt or explanation before revealing the solution.");
        var p = EnsureProgress(e);
        p.SolutionRevealed = true;
        await db.SaveChangesAsync(ct);
        return ToDetail(e);
    }

    public async Task<ExerciseDetailDto> SetStatusAsync(int id, PracticeStatus status, CancellationToken ct)
    {
        var e = await LoadAsync(id, ct);
        var p = EnsureProgress(e);
        var now = clock.GetUtcNow().UtcDateTime;
        if (status == PracticeStatus.NotStarted)
        {
            // Reset: start the exercise again from scratch.
            p.UserAnswer = null;
            p.HintsRevealed = 0;
            p.SolutionRevealed = false;
            p.CompletedAt = null;
        }
        else if (status == PracticeStatus.Completed)
        {
            p.CompletedAt ??= now;
        }
        else
        {
            p.CompletedAt = null;
        }
        p.Status = status;
        p.UpdatedAt = now;
        await db.SaveChangesAsync(ct);
        return ToDetail(e);
    }

    private async Task<PracticeExercise> LoadAsync(int id, CancellationToken ct, bool tracking = true)
    {
        var q = db.PracticeExercises.Include(e => e.Topic).Include(e => e.ProgressRows).AsQueryable();
        if (!tracking) q = q.AsNoTracking();
        return await q.SingleOrDefaultAsync(e => e.Id == id, ct) ?? throw new NotFoundException("PracticeExercise", id);
    }

    private PracticeProgress EnsureProgress(PracticeExercise e)
    {
        // ProgressRows was loaded with the query filter, so it holds only the signed-in user's row.
        var progress = e.ProgressRows.FirstOrDefault();
        if (progress is null)
        {
            progress = new PracticeProgress { ExerciseId = e.Id, Status = PracticeStatus.NotStarted };
            e.ProgressRows.Add(progress);
            db.PracticeProgress.Add(progress);
        }
        progress.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        return progress;
    }

    private static ExerciseDetailDto ToDetail(PracticeExercise e)
    {
        var hintsEn = ProjectService.SplitLines(e.HintsEn);
        var hintsAr = ProjectService.SplitLines(e.HintsAr);
        var revealed = Math.Min(e.ProgressRows.FirstOrDefault()?.HintsRevealed ?? 0, hintsEn.Count);
        var showSolution = e.ProgressRows.FirstOrDefault()?.SolutionRevealed == true;

        return new ExerciseDetailDto(
            new ExerciseSummaryDto(e.Id, e.Key, e.Type, e.TopicId, e.Topic.TitleEn, e.Topic.TitleAr, e.Difficulty,
                e.EstimatedMinutes, e.TitleEn, e.TitleAr, e.ProgressRows.FirstOrDefault()?.Status ?? PracticeStatus.NotStarted),
            e.ProblemEn, e.ProblemAr, e.Code, e.CodeLanguage, e.ExpectedOutcomeEn, e.ExpectedOutcomeAr,
            hintsEn.Count, hintsEn.Take(revealed).ToList(), hintsAr.Take(revealed).ToList(),
            e.ProgressRows.FirstOrDefault()?.UserAnswer, showSolution,
            showSolution ? e.SolutionEn : null, showSolution ? e.SolutionAr : null, showSolution ? e.SolutionCode : null,
            e.ProgressRows.FirstOrDefault()?.CompletedAt);
    }
}
