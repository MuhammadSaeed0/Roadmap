using System.Text.Json;
using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services.Skills;

/// <summary>
/// The developer level dashboard. Loads the signed-in learner's progress, scores it with <see cref="SkillCalculator"/>,
/// and keeps the XP ledger in step with it.
///
/// Reconciling is idempotent: each source's rows already add up to what it is worth, so a second run writes nothing.
/// Existing progress is credited the first time the dashboard is opened, with no migration of old data.
/// </summary>
public class SkillAssessmentService(AppDbContext db, SkillRules rules, TimeProvider clock, ICurrentUser currentUser, ILogger<SkillAssessmentService> logger)
{
    private readonly SkillCalculator calculator = new(rules);

    public async Task<SkillLevelDto> GetAsync(CancellationToken ct)
    {
        var snapshot = await LoadSnapshotAsync(ct);
        var now = clock.GetUtcNow().UtcDateTime;
        var result = calculator.Calculate(snapshot, now);
        await ReconcileAsync(result, now, ct);

        var recent = await db.XpTransactions.AsNoTracking().OrderByDescending(x => x.Id).Take(8).ToListAsync(ct);
        var history = await db.LevelChanges.AsNoTracking().OrderBy(x => x.ChangedAt).ThenBy(x => x.Id)
            .Select(x => new LevelChangeDto(x.Level, x.PreviousLevel, x.Xp, x.Overall, x.ChangedAt)).ToListAsync(ct);
        var next = result.LevelIndex + 1 < rules.Levels.Count ? rules.Levels[result.LevelIndex + 1].Key : null;

        return new SkillLevelDto(
            result.Level, result.LevelIndex, next, result.XpLevel, result.LevelIndex < rules.Levels.FindIndex(l => l.Key == result.XpLevel),
            result.Xp, result.MaxXp, result.Overall, result.ProgressToNext, result.Levels,
            result.Categories.Where(c => c.MaxPoints > 0)
                .Select(c => new CategoryScoreDto(c.Key, c.Weight, c.Score, SkillCalculator.Proficiency(c.Score), c.Evidence, c.Points, c.MaxPoints))
                .ToList(),
            result.Technologies, result.Stats, result.WeakCategories, result.WeakTopics, result.NextLevel, result.Assessment,
            recent.Select(ToDto).ToList(), history);
    }

    public async Task<PagedXpDto> GetHistoryAsync(int page, int pageSize, CancellationToken ct)
    {
        pageSize = Math.Clamp(pageSize, 5, 100);
        page = Math.Max(1, page);
        var total = await db.XpTransactions.CountAsync(ct);
        var rows = await db.XpTransactions.AsNoTracking().OrderByDescending(x => x.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new PagedXpDto(rows.Select(ToDto).ToList(), page, pageSize, total);
    }

    public SkillRulesDto GetRules() => new(
        rules.Points, rules.Verification, rules.EvidenceWeights,
        rules.Categories.Select(c => new CategoryRuleDto(c.Key, c.Weight, c.Skill)).ToList(),
        rules.Levels.Select(l => new LevelRuleDto(l.Key, l.MinXp, l.MinOverall, l.Categories, l.MinProjectTasks, l.MinProjectsCompleted, l.MinAdvancedProjects)).ToList(),
        rules.ReviewCriteria.Select(c => c.Key).ToList());

    // ------------------------------------------------------------------ project review (rubric)

    public async Task<ProjectAssessmentDto> GetProjectAssessmentAsync(int projectId, CancellationToken ct)
    {
        if (!await db.Projects.AnyAsync(p => p.Id == projectId, ct)) throw new NotFoundException("Project", projectId);
        var row = await db.ProjectAssessments.AsNoTracking().SingleOrDefaultAsync(a => a.ProjectId == projectId, ct);
        return await ToDtoAsync(projectId, row, ct);
    }

    public async Task<ProjectAssessmentDto> SaveProjectAssessmentAsync(int projectId, SaveProjectAssessmentRequest request, CancellationToken ct)
    {
        if (!await db.Projects.AnyAsync(p => p.Id == projectId, ct)) throw new NotFoundException("Project", projectId);
        var keys = rules.ReviewCriteria.Select(c => c.Key).ToHashSet();
        var scores = request.Scores ?? [];
        var unknown = scores.Keys.FirstOrDefault(k => !keys.Contains(k));
        if (unknown is not null) throw new RequestValidationException("scores", "unknown_criterion", $"'{unknown}' is not a review criterion.");
        if (scores.Values.Any(v => v is < 0 or > 4)) throw new RequestValidationException("scores", "invalid_score", "Each score must be between 0 and 4.");

        var row = await db.ProjectAssessments.SingleOrDefaultAsync(a => a.ProjectId == projectId, ct);
        if (row is null)
        {
            row = new ProjectAssessment { ProjectId = projectId };
            db.ProjectAssessments.Add(row);
        }
        row.Scores = JsonSerializer.Serialize(scores);
        row.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
        // The learner reviewing their own project is self-reported, whatever the scores say.
        row.Verification = VerificationTier.SelfReported;
        row.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return await ToDtoAsync(projectId, row, ct);
    }

    private async Task<ProjectAssessmentDto> ToDtoAsync(int projectId, ProjectAssessment? row, CancellationToken ct)
    {
        var tasks = await db.ProjectTasks.AsNoTracking().Where(t => t.Milestone.ProjectId == projectId && !t.IsChangeRequest)
            .Select(t => t.ProgressRows.Any(p => p.Status == ProjectTaskStatus.Completed)).ToListAsync(ct);
        return new ProjectAssessmentDto(projectId, rules.ReviewCriteria.Select(c => c.Key).ToList(), ParseScores(row?.Scores),
            row?.Notes, row?.Verification ?? VerificationTier.SelfReported, row?.UpdatedAt,
            CountsTowardsLevel: tasks.Count > 0 && tasks.All(x => x));
    }

    private static Dictionary<string, int> ParseScores(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try { return JsonSerializer.Deserialize<Dictionary<string, int>>(json) ?? []; }
        catch (JsonException) { return []; }
    }

    // ------------------------------------------------------------------ ledger

    /// <summary>
    /// Appends one row per source whose rows don't add up to what the source is worth now. Sources that are no longer
    /// worth anything (a re-opened task, a deleted exercise) get a reversing row.
    /// </summary>
    private async Task ReconcileAsync(SkillResult result, DateTime now, CancellationToken ct)
    {
        var existing = await db.XpTransactions.AsNoTracking()
            .GroupBy(x => x.SourceKey)
            .Select(g => new { Key = g.Key, Sum = g.Sum(x => x.Points), Seq = g.Max(x => x.Seq) })
            .ToDictionaryAsync(x => x.Key, ct);
        var byKey = result.Opportunities.ToDictionary(o => o.Key);

        var orphanKeys = existing.Keys.Where(k => !byKey.ContainsKey(k) && existing[k].Sum != 0).ToList();
        var orphanInfo = new List<XpTransaction>();
        if (orphanKeys.Count > 0)
        {
            var orphanRows = await db.XpTransactions.AsNoTracking().Where(x => orphanKeys.Contains(x.SourceKey)).ToListAsync(ct);
            orphanInfo = orphanRows.GroupBy(x => x.SourceKey).Select(g => g.OrderByDescending(x => x.Seq).First()).ToList();
        }

        var rows = new List<XpTransaction>();
        foreach (var o in result.Opportunities)
        {
            var current = existing.GetValueOrDefault(o.Key);
            var sum = current?.Sum ?? 0;
            if (sum == o.Points) continue;
            rows.Add(new XpTransaction
            {
                SourceKey = o.Key, Seq = (current?.Seq ?? 0) + 1, Activity = o.Activity, Evidence = o.Evidence, Verification = o.Verification,
                Points = o.Points - sum, Balance = o.Points, Categories = string.Join(',', o.Categories), OccurredAt = o.OccurredAt, CreatedAt = now,
            });
        }
        foreach (var last in orphanInfo)
        {
            var current = existing[last.SourceKey];
            rows.Add(new XpTransaction
            {
                SourceKey = last.SourceKey, Seq = current.Seq + 1, Activity = last.Activity, Evidence = last.Evidence, Verification = last.Verification,
                Points = -current.Sum, Balance = 0, Categories = last.Categories, OccurredAt = null, CreatedAt = now,
            });
        }

        var lastLevel = await db.LevelChanges.AsNoTracking().OrderByDescending(x => x.ChangedAt).ThenByDescending(x => x.Id)
            .Select(x => x.Level).FirstOrDefaultAsync(ct);
        if (lastLevel != result.Level)
            db.LevelChanges.Add(new LevelChange { Level = result.Level, PreviousLevel = lastLevel ?? "", Xp = result.Xp, Overall = result.Overall, ChangedAt = now });

        if (rows.Count == 0 && lastLevel == result.Level) return;
        db.XpTransactions.AddRange(rows);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex)
        {
            // Another request reconciled the same sources at the same moment; its rows already hold the same totals.
            logger.LogInformation(ex, "XP reconcile collided with a concurrent request; keeping the other request's rows.");
            db.ChangeTracker.Clear();
        }
    }

    private static XpTransactionDto ToDto(XpTransaction x) => new(x.Id, x.SourceKey, x.Activity, x.Evidence, x.Verification,
        x.Points, x.Balance, x.Categories.Split(',', StringSplitOptions.RemoveEmptyEntries), x.OccurredAt, x.CreatedAt);

    // ------------------------------------------------------------------ snapshot

    public async Task<SkillSnapshot> LoadSnapshotAsync(CancellationToken ct)
    {
        var progress = await db.TopicProgress.AsNoTracking()
            .Select(p => new { p.TopicId, p.Status, p.CompletedAt, p.UpdatedAt }).ToDictionaryAsync(p => p.TopicId, ct);
        var topicRows = await db.Topics.AsNoTracking().OrderBy(t => t.Phase.Order).ThenBy(t => t.Order)
            .Select(t => new { t.Id, t.Slug, PhaseSlug = t.Phase.Slug, t.Skill, t.Priority, t.Difficulty, t.EstimatedMinutes, t.TitleEn, t.TitleAr })
            .ToListAsync(ct);
        var topics = topicRows.Select((t, i) =>
        {
            var p = progress.GetValueOrDefault(t.Id);
            return new TopicFact(t.Id, t.Slug, t.PhaseSlug, i, t.Skill, t.Priority, t.Difficulty, t.EstimatedMinutes, t.TitleEn, t.TitleAr,
                p?.Status ?? TopicStatus.NotStarted, p?.CompletedAt, p?.UpdatedAt);
        }).ToList();

        var watched = await db.VideoProgress.AsNoTracking().Where(v => v.IsWatched)
            .Select(v => new VideoFact(v.VideoId, v.TopicId, v.UpdatedAt)).ToListAsync(ct);
        var curated = await db.CuratedVideos.AsNoTracking().GroupBy(v => v.TopicId)
            .Select(g => new { g.Key, Count = g.Count() }).ToDictionaryAsync(x => x.Key, x => x.Count, ct);
        var notes = await db.Notes.AsNoTracking().Where(n => n.TopicId != null)
            .GroupBy(n => n.TopicId!.Value).Select(g => new { g.Key, Max = g.Max(n => n.Content.Length) })
            .ToDictionaryAsync(x => x.Key, x => x.Max, ct);

        var questions = await db.QuizQuestions.AsNoTracking().Select(q => new QuestionFact(q.Id, q.TopicId)).ToListAsync(ct);
        var answers = await db.QuizAnswers.AsNoTracking().Select(a => new AnswerFact(a.QuestionId, a.IsCorrect, a.CreatedAt)).ToListAsync(ct);
        var attempts = await db.QuizAttempts.AsNoTracking()
            .Select(a => new AttemptFact(a.TopicId, a.Level, a.Score, a.Total, a.CreatedAt, a.Answers.Any())).ToListAsync(ct);

        var interviews = await db.InterviewQuestions.AsNoTracking()
            .Select(q => new
            {
                q.Id, q.TopicId, q.Category, q.Difficulty,
                Rating = q.ProgressRows.Select(p => (InterviewRating?)p.Rating).FirstOrDefault(),
                At = q.ProgressRows.Select(p => (DateTime?)p.LastPracticedAt).FirstOrDefault(),
            })
            .ToListAsync(ct);

        var exercises = await db.PracticeExercises.AsNoTracking()
            .Select(e => new
            {
                e.Id, e.TopicId, e.Type, e.Difficulty, HasChecks = e.Tests != null && e.Tests != "", e.Technologies, e.TitleEn, e.TitleAr,
                e.AcceptanceEn, e.Runner,
                P = e.ProgressRows.Select(p => new
                {
                    p.Status, p.BestScore, p.HintsRevealed, p.SolutionRevealed, p.UserAnswer, p.CheckedCriteria, p.CompletedAt,
                }).FirstOrDefault(),
            })
            .ToListAsync(ct);

        var projects = await db.Projects.AsNoTracking().OrderBy(p => p.Order)
            .Select(p => new
            {
                p.Id, p.Slug, p.Order, p.TitleEn, p.TitleAr,
                HasRepository = p.Repositories.Any(),
                PortfolioDone = p.PortfolioChecks.Count(c => c.IsDone),
                Tasks = p.Milestones.SelectMany(m => m.Tasks).Select(t => new
                {
                    t.Id, t.EstimatedMinutes, t.IsChangeRequest, t.TitleEn, t.TitleAr,
                    TopicIds = t.TopicLinks.Select(l => l.TopicId).ToList(),
                    Done = t.ProgressRows.Any(r => r.Status == ProjectTaskStatus.Completed),
                    CompletedAt = t.ProgressRows.Select(r => r.CompletedAt).FirstOrDefault(),
                }).ToList(),
            })
            .AsSplitQuery()
            .ToListAsync(ct);
        var checklistTotal = await db.PortfolioChecklistItems.CountAsync(ct);
        var reviews = await db.ProjectAssessments.AsNoTracking().ToDictionaryAsync(a => a.ProjectId, ct);
        var studyMinutes = await db.StudySessions.SumAsync(s => (int?)s.ActualMinutes, ct) ?? 0;

        // Discussions are shared between accounts (no per-user query filter), so filter on the author explicitly.
        // Accepting your own reply earns nothing.
        var userId = currentUser.Id;
        var accepted = userId is null ? [] : await db.Discussions.AsNoTracking()
            .Where(d => d.AcceptedReplyId != null && d.AuthorId != userId)
            .Join(db.DiscussionReplies, d => d.AcceptedReplyId, r => (int?)r.Id, (d, r) => new { d, r })
            .Where(x => x.r.AuthorId == userId)
            .Select(x => new AcceptedAnswerFact(x.r.Id, x.d.TopicId, x.d.TitleEn, x.d.TitleAr, x.d.UpdatedAt))
            .ToListAsync(ct);

        return new SkillSnapshot(
            topics, watched, curated, notes, questions, answers, attempts,
            interviews.Select(q => new InterviewFact(q.Id, q.TopicId, q.Category, q.Difficulty, q.Rating, q.At)).ToList(),
            exercises.Select(e => new ExerciseFact(
                e.Id, e.TopicId, e.Type, e.Difficulty, e.HasChecks, PracticeService.ParseSkills(e.Technologies), e.TitleEn, e.TitleAr,
                e.P?.Status ?? PracticeStatus.NotStarted, e.P?.BestScore, e.P?.HintsRevealed ?? 0, e.P?.SolutionRevealed ?? false,
                !string.IsNullOrWhiteSpace(e.P?.UserAnswer), ProjectService.SplitLines(e.AcceptanceEn).Count,
                (e.P?.CheckedCriteria ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries).Distinct().Count(),
                e.P?.CompletedAt, e.Runner)).ToList(),
            projects.Select(p => new ProjectFact(p.Id, p.Slug, p.Order, p.TitleEn, p.TitleAr, p.HasRepository,
                p.Tasks.Select(t => new ProjectTaskFact(t.Id, t.EstimatedMinutes, t.IsChangeRequest, t.TopicIds, t.Done, t.CompletedAt, t.TitleEn, t.TitleAr)).ToList(),
                p.PortfolioDone, checklistTotal,
                reviews.TryGetValue(p.Id, out var r) ? new ProjectReviewFact(ParseScores(r.Scores), r.Verification, r.UpdatedAt) : null)).ToList(),
            studyMinutes, accepted);
    }
}
