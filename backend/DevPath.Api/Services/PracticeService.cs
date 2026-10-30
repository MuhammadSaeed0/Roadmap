using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Practice workflow: read the problem → write your attempt (an explanation, or code in the
/// embedded editor) → reveal hints one at a time → reveal the solution (only after an attempt
/// is saved) → mark completed. The API enforces this order, so the solution is never sent
/// before you've tried.
///
/// Code runs only in the learner's browser. When an exercise has automatic checks, the browser
/// runs them and reports how many passed; that score is the learner's own record, not a
/// verified grade.
/// </summary>
public class PracticeService(AppDbContext db, TimeProvider clock)
{
    /// <summary>Share of a level's exercises to complete before the next level becomes "current".</summary>
    private const double LevelUpShare = 0.7;

    public async Task<PracticeOverviewDto> ListAsync(PracticeFilter filter, CancellationToken ct)
    {
        var all = await db.PracticeExercises.AsNoTracking()
            .OrderBy(e => e.Topic.Phase.Order).ThenBy(e => e.Topic.Order).ThenBy(e => e.Difficulty).ThenBy(e => e.Id)
            .Select(e => new
            {
                e.Id, e.Key, e.Type, e.TopicId, TopicTitleEn = e.Topic.TitleEn, TopicTitleAr = e.Topic.TitleAr,
                e.Difficulty, e.EstimatedMinutes, e.TitleEn, e.TitleAr, e.Topic.Skill, e.Runner, e.Technologies,
                Status = e.ProgressRows.Select(p => (PracticeStatus?)p.Status).FirstOrDefault() ?? PracticeStatus.NotStarted,
                BestScore = e.ProgressRows.Select(p => p.BestScore).FirstOrDefault(),
            })
            .ToListAsync(ct);

        var exercises = all.Select(e => new ExerciseSummaryDto(e.Id, e.Key, e.Type, e.TopicId, e.TopicTitleEn, e.TopicTitleAr,
                e.Difficulty, e.EstimatedMinutes, e.TitleEn, e.TitleAr, e.Status, e.Skill, e.Runner, ParseSkills(e.Technologies), e.BestScore))
            .ToList();

        var stats = Enum.GetValues<ExerciseType>()
            .Select(t => new PracticeTypeStatsDto(t,
                exercises.Count(e => e.Type == t),
                exercises.Count(e => e.Type == t && e.Status == PracticeStatus.Completed),
                exercises.Count(e => e.Type == t && e.Status == PracticeStatus.Attempted)))
            .Where(s => s.Total > 0)
            .ToList();

        var skills = exercises.GroupBy(e => e.Skill)
            .OrderBy(g => g.Key)
            .Select(g => SkillStats(g.Key, g.ToList()))
            .ToList();

        var search = filter.Search?.Trim();
        var filtered = exercises
            .Where(e => filter.Type == null || e.Type == filter.Type)
            .Where(e => filter.TopicId == null || e.TopicId == filter.TopicId)
            .Where(e => filter.Skill == null || e.Skill == filter.Skill || e.Technologies.Contains(filter.Skill.Value))
            .Where(e => filter.Difficulty == null || e.Difficulty == filter.Difficulty)
            .Where(e => filter.Status == null || e.Status == filter.Status)
            .Where(e => filter.Runner == null || e.Runner == filter.Runner)
            .Where(e => string.IsNullOrEmpty(search) ||
                e.TitleEn.Contains(search, StringComparison.OrdinalIgnoreCase) || e.TitleAr.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                e.TopicTitleEn.Contains(search, StringComparison.OrdinalIgnoreCase) || e.TopicTitleAr.Contains(search, StringComparison.OrdinalIgnoreCase))
            .ToList();

        return new PracticeOverviewDto(filtered, stats, skills, exercises.Count,
            exercises.Count(e => e.Status == PracticeStatus.Completed), exercises.Count(e => e.Status == PracticeStatus.Attempted));
    }

    /// <summary>
    /// The current level in a technology is the first difficulty (from Beginner up) where the learner
    /// has completed less than 70% of the exercises; finishing 70% of a level moves them on.
    /// </summary>
    public static PracticeSkillStatsDto SkillStats(SkillArea skill, IReadOnlyList<ExerciseSummaryDto> exercises)
    {
        var byDifficulty = Enum.GetValues<Difficulty>()
            .Select(d => new PracticeDifficultyStatsDto(d,
                exercises.Count(e => e.Difficulty == d),
                exercises.Count(e => e.Difficulty == d && e.Status == PracticeStatus.Completed)))
            .ToList();
        var level = byDifficulty.FirstOrDefault(d => d.Total > 0 && d.Completed < Math.Ceiling(d.Total * LevelUpShare))?.Difficulty
            ?? byDifficulty.LastOrDefault(d => d.Total > 0)?.Difficulty
            ?? Difficulty.Beginner;
        return new PracticeSkillStatsDto(skill, exercises.Count,
            exercises.Count(e => e.Status == PracticeStatus.Completed),
            exercises.Count(e => e.Status == PracticeStatus.Attempted),
            level, byDifficulty.Where(d => d.Total > 0).ToList());
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
        MarkAttempted(p);
        await db.SaveChangesAsync(ct);
        return ToDetail(e);
    }

    /// <summary>Saves the learner's code (the editor saves as they type). Saving code counts as an attempt.</summary>
    public async Task<ExerciseDetailDto> SaveFilesAsync(int id, IReadOnlyList<WorkspaceFileDto> files, CancellationToken ct)
    {
        var valid = WorkspaceFiles.Validate(files);
        var e = await LoadAsync(id, ct);
        if (e.Runner == ExerciseRunner.None && e.StarterFiles is null && e.Code is null)
            throw new BusinessRuleException("no_code_workspace", "This exercise has no code to save; write your answer instead.");
        var p = EnsureProgress(e);
        p.SavedFiles = WorkspaceFiles.Serialize(valid);
        MarkAttempted(p);
        await db.SaveChangesAsync(ct);
        return ToDetail(e);
    }

    /// <summary>Records a run of the automatic checks. Passing every check completes the exercise.</summary>
    public async Task<ExerciseDetailDto> SubmitAsync(int id, IReadOnlyList<WorkspaceFileDto> files, int passed, int total, CancellationToken ct)
    {
        if (passed > total) throw new RequestValidationException("passed", "invalid_score", "Passed checks can't exceed the total.");
        var valid = WorkspaceFiles.Validate(files);
        var e = await LoadAsync(id, ct);
        if (string.IsNullOrWhiteSpace(e.Tests))
            throw new BusinessRuleException("no_checks", "This exercise has no automatic checks; complete it with its checklist instead.");
        var p = EnsureProgress(e);
        var now = clock.GetUtcNow().UtcDateTime;
        var score = (int)Math.Round(100.0 * passed / total);
        p.SavedFiles = WorkspaceFiles.Serialize(valid);
        p.Submissions++;
        p.LastScore = score;
        p.BestScore = Math.Max(p.BestScore ?? 0, score);
        p.LastSubmittedAt = now;
        if (passed == total)
        {
            p.Status = PracticeStatus.Completed;
            p.CompletedAt ??= now;
        }
        else MarkAttempted(p);
        await db.SaveChangesAsync(ct);
        return ToDetail(e);
    }

    public async Task<ExerciseDetailDto> SaveCriteriaAsync(int id, IReadOnlyList<int> criteria, CancellationToken ct)
    {
        var e = await LoadAsync(id, ct);
        var count = ProjectService.SplitLines(e.AcceptanceEn).Count;
        if (criteria.Any(i => i < 0 || i >= count))
            throw new RequestValidationException("checked", "invalid_criterion", "One of the ticked criteria doesn't exist.");
        var p = EnsureProgress(e);
        p.CheckedCriteria = string.Join(',', criteria.Distinct().Order());
        MarkAttempted(p);
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
        MarkAttempted(p);
        await db.SaveChangesAsync(ct);
        return ToDetail(e);
    }

    public async Task<ExerciseDetailDto> RevealSolutionAsync(int id, CancellationToken ct)
    {
        var e = await LoadAsync(id, ct);
        var existing = e.ProgressRows.FirstOrDefault();
        var tried = !string.IsNullOrWhiteSpace(existing?.UserAnswer) || existing?.SavedFiles is not null || existing?.Submissions > 0;
        if (!tried)
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
            p.SavedFiles = null;
            p.CheckedCriteria = null;
            p.LastScore = null;
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

    private static void MarkAttempted(PracticeProgress p)
    {
        if (p.Status == PracticeStatus.NotStarted) p.Status = PracticeStatus.Attempted;
    }

    public static IReadOnlyList<SkillArea> ParseSkills(string? csv) =>
        string.IsNullOrWhiteSpace(csv)
            ? []
            : csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(s => Enum.TryParse<SkillArea>(s, out var skill) ? skill : (SkillArea?)null)
                .Where(s => s is not null).Select(s => s!.Value).ToList();

    /// <summary>The files the learner starts from: the multi-file starter, or the single code snippet.</summary>
    public static IReadOnlyList<WorkspaceFileDto> StarterFilesOf(PracticeExercise e) =>
        WorkspaceFiles.Deserialize(e.StarterFiles)
        ?? (e.Code is null ? [] : [new WorkspaceFileDto(DefaultFileName(e.CodeLanguage), e.Code)]);

    private static string DefaultFileName(string? language) => language switch
    {
        "csharp" => "Program.cs",
        "sql" => "query.sql",
        "typescript" => "main.ts",
        "javascript" => "main.js",
        "html" => "index.html",
        "css" => "styles.css",
        "json" => "data.json",
        "bash" => "commands.sh",
        "http" => "requests.http",
        _ => "notes.txt",
    };

    private static ExerciseDetailDto ToDetail(PracticeExercise e)
    {
        var progress = e.ProgressRows.FirstOrDefault();
        var hintsEn = ProjectService.SplitLines(e.HintsEn);
        var hintsAr = ProjectService.SplitLines(e.HintsAr);
        var revealed = Math.Min(progress?.HintsRevealed ?? 0, hintsEn.Count);
        var showSolution = progress?.SolutionRevealed == true;
        var criteria = (progress?.CheckedCriteria ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => int.TryParse(s, out var i) ? i : -1).Where(i => i >= 0).ToList();

        return new ExerciseDetailDto(
            new ExerciseSummaryDto(e.Id, e.Key, e.Type, e.TopicId, e.Topic.TitleEn, e.Topic.TitleAr, e.Difficulty,
                e.EstimatedMinutes, e.TitleEn, e.TitleAr, progress?.Status ?? PracticeStatus.NotStarted,
                e.Topic.Skill, e.Runner, ParseSkills(e.Technologies), progress?.BestScore),
            e.ProblemEn, e.ProblemAr, e.Code, e.CodeLanguage, e.ExpectedOutcomeEn, e.ExpectedOutcomeAr,
            hintsEn.Count, hintsEn.Take(revealed).ToList(), hintsAr.Take(revealed).ToList(),
            progress?.UserAnswer, showSolution,
            showSolution ? e.SolutionEn : null, showSolution ? e.SolutionAr : null, showSolution ? e.SolutionCode : null,
            progress?.CompletedAt,
            StarterFilesOf(e), e.Tests, e.Dataset,
            e.ScenarioEn, e.ScenarioAr,
            ProjectService.SplitLines(e.RequirementsEn), ProjectService.SplitLines(e.RequirementsAr),
            ProjectService.SplitLines(e.AcceptanceEn), ProjectService.SplitLines(e.AcceptanceAr),
            ProjectService.SplitLines(e.BonusEn), ProjectService.SplitLines(e.BonusAr),
            WorkspaceFiles.Deserialize(progress?.SavedFiles), progress?.Submissions ?? 0, progress?.LastScore, progress?.LastSubmittedAt,
            criteria, showSolution ? WorkspaceFiles.Deserialize(e.SolutionFiles) : null);
    }
}

public record PracticeFilter(
    ExerciseType? Type = null, int? TopicId = null, SkillArea? Skill = null, Difficulty? Difficulty = null,
    PracticeStatus? Status = null, ExerciseRunner? Runner = null, string? Search = null);
