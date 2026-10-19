using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DevPath.Api.Services;

public record TopicQuery(
    string? Q, SkillArea? Skill, TopicStatus? Status, int? PhaseId, TopicPriority? Priority,
    KnowledgeLevel? Knowledge, int Page = 1, int PageSize = 20);

public class TopicService(
    AppDbContext db, LearningStateLoader stateLoader, ProjectService projects, ResourceService resources,
    IOptions<ProgressOptions> options, TimeProvider clock)
{
    public async Task<RoadmapDto> GetRoadmapAsync(CancellationToken ct)
    {
        var state = await stateLoader.LoadAsync(ct);
        var topicExtras = await db.Topics.AsNoTracking()
            .Select(t => new { t.Id, t.SummaryEn, t.SummaryAr, InReview = t.ReviewSchedule != null })
            .ToDictionaryAsync(t => t.Id, ct);
        var phaseInfo = await db.Phases.AsNoTracking().ToDictionaryAsync(p => p.Id, ct);
        var projectSummaries = await projects.GetSummariesAsync(ct);

        var byPhase = state.Topics.ToLookup(t => t.PhaseId);
        var lastPhaseId = state.Phases.LastOrDefault()?.Id;

        var phases = state.Phases.Select(p =>
        {
            var topics = byPhase[p.Id].ToList();
            var info = phaseInfo[p.Id];
            // Projects appear in the final "Full-Stack Projects" phase.
            var phaseProjects = p.Id == lastPhaseId && topics.Count == 0
                ? projectSummaries.Select(s => new ProjectBriefDto(s.Id, s.Slug, s.TitleEn, s.TitleAr, s.TechStack, s.Percent)).ToList()
                : [];
            return new PhaseDto(
                p.Id, p.Slug, p.Order, p.TitleEn, p.TitleAr, info.DescriptionEn, info.DescriptionAr,
                topics.Count, topics.Count(t => t.IsDone),
                topics.Count > 0
                    ? ProgressCalculator.WeightedPercent(topics, options.Value)
                    : projectSummaries.Count == 0 ? 0 : Math.Round(projectSummaries.Average(s => s.Percent), 1),
                topics.Where(t => !t.IsDone).Sum(t => t.Minutes),
                topics.Select(t => ToSummary(t, state, topicExtras[t.Id].SummaryEn, topicExtras[t.Id].SummaryAr, topicExtras[t.Id].InReview)).ToList(),
                phaseProjects);
        }).ToList();

        return new RoadmapDto(phases, ProgressCalculator.CurrentPhase(state)?.Id);
    }

    public async Task<PagedResult<TopicSummaryDto>> SearchAsync(TopicQuery query, CancellationToken ct)
    {
        var page = Math.Max(1, query.Page);
        var size = Math.Clamp(query.PageSize, 1, 100);

        IQueryable<Topic> q = db.Topics.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var pattern = SearchService.LikePattern(query.Q);
            q = q.Where(t => EF.Functions.Like(t.TitleEn, pattern) || EF.Functions.Like(t.TitleAr, pattern)
                          || EF.Functions.Like(t.SummaryEn, pattern) || EF.Functions.Like(t.SummaryAr, pattern));
        }
        if (query.Skill is { } skill) q = q.Where(t => t.Skill == skill);
        if (query.PhaseId is { } phaseId) q = q.Where(t => t.PhaseId == phaseId);
        if (query.Priority is { } priority) q = q.Where(t => t.Priority == priority);
        if (query.Status is { } status)
            q = status == TopicStatus.NotStarted
                ? q.Where(t => t.Progress == null || t.Progress.Status == TopicStatus.NotStarted)
                : q.Where(t => t.Progress != null && t.Progress.Status == status);
        if (query.Knowledge is { } knowledge)
            q = knowledge == KnowledgeLevel.Unassessed
                ? q.Where(t => t.Progress == null || t.Progress.Knowledge == KnowledgeLevel.Unassessed)
                : q.Where(t => t.Progress != null && t.Progress.Knowledge == knowledge);

        var total = await q.CountAsync(ct);
        var rows = await q
            .OrderBy(t => t.Phase.Order).ThenBy(t => t.Order)
            .Skip((page - 1) * size).Take(size)
            .Select(t => new { t.Id, t.SummaryEn, t.SummaryAr, InReview = t.ReviewSchedule != null })
            .ToListAsync(ct);

        var state = await stateLoader.LoadAsync(ct);
        var items = rows.Select(r => ToSummary(state.ById[r.Id], state, r.SummaryEn, r.SummaryAr, r.InReview)).ToList();
        return new PagedResult<TopicSummaryDto>(items, page, size, total);
    }

    public async Task<TopicDetailDto> GetDetailAsync(int id, CancellationToken ct)
    {
        var topic = await db.Topics.AsNoTracking()
            .Include(t => t.Phase)
            .Include(t => t.Progress)
            .Include(t => t.ReviewSchedule)
            .SingleOrDefaultAsync(t => t.Id == id, ct)
            ?? throw new NotFoundException("Topic", id);

        // Resources link back to topics (a cycle), so they're loaded with their own query.
        var resourceList = await resources.ListAsync(id, null, null, null, ct);

        var state = await stateLoader.LoadAsync(ct);
        var me = state.ById[id];
        TopicRefDto Ref(int topicId) => ProgressCalculator.ToRef(state.ById[topicId]);

        var projectLinks = await db.ProjectTaskTopics.AsNoTracking()
            .Where(l => l.TopicId == id)
            .GroupBy(l => new { l.ProjectTask.Milestone.Project.Id, l.ProjectTask.Milestone.Project.Slug,
                                l.ProjectTask.Milestone.Project.TitleEn, l.ProjectTask.Milestone.Project.TitleAr })
            .Select(g => new TopicProjectLinkDto(g.Key.Id, g.Key.Slug, g.Key.TitleEn, g.Key.TitleAr, g.Count()))
            .ToListAsync(ct);

        // Sorted in memory: enums are stored as strings, so SQL would order them alphabetically.
        var questions = (await db.InterviewQuestions.AsNoTracking()
            .Where(q => q.TopicId == id)
            .Select(q => new InterviewRefDto(q.Id, q.QuestionEn, q.QuestionAr, q.Difficulty,
                q.Progress != null ? q.Progress.Rating : null))
            .ToListAsync(ct))
            .OrderBy(q => q.Difficulty).ThenBy(q => q.Id).ToList();

        var exercises = (await db.PracticeExercises.AsNoTracking()
            .Where(e => e.TopicId == id)
            .Select(e => new ExerciseRefDto(e.Id, e.Type, e.TitleEn, e.TitleAr, e.Difficulty,
                e.Progress != null ? e.Progress.Status : PracticeStatus.NotStarted))
            .ToListAsync(ct))
            .OrderBy(e => e.Type).ThenBy(e => e.Id).ToList();

        var sessions = await db.StudySessions.AsNoTracking()
            .Where(s => s.TopicId == id)
            .OrderByDescending(s => s.SessionDate).ThenByDescending(s => s.Id)
            .Select(StudySessionService.Projection)
            .ToListAsync(ct);

        var noteCount = await db.Notes.CountAsync(n => n.TopicId == id, ct);
        var today = Today();

        return new TopicDetailDto(
            topic.Id, topic.Slug,
            new PhaseRefDto(topic.Phase.Id, topic.Phase.Slug, topic.Phase.Order, topic.Phase.TitleEn, topic.Phase.TitleAr),
            topic.Order, topic.Skill, topic.Priority, topic.EstimatedMinutes,
            topic.TitleEn, topic.TitleAr, topic.SummaryEn, topic.SummaryAr, topic.WhyEn, topic.WhyAr,
            topic.HowEn, topic.HowAr, topic.ExampleEn, topic.ExampleAr, topic.CodeSample, topic.CodeLanguage,
            topic.PracticeTaskEn, topic.PracticeTaskAr, topic.ChallengeEn, topic.ChallengeAr,
            me.Status, me.Knowledge, me.Confidence, me.CompletedAt, state.PrerequisitesMet(me),
            me.PrerequisiteIds.Select(Ref).ToList(),
            state.Dependents.GetValueOrDefault(id, []).Select(Ref).ToList(),
            state.Topics.Where(t => t.PhaseId == me.PhaseId && t.Id != id).Select(ProgressCalculator.ToRef).ToList(),
            resourceList.OrderBy(r => r.Type).ThenBy(r => r.Id).ToList(),
            projectLinks, questions, exercises,
            sessions.Take(10).ToList(), sessions.Sum(s => s.ActualMinutes), noteCount,
            topic.ReviewSchedule is { } r
                ? new ReviewStateDto(r.IntervalDays, r.NextReviewOn, r.LastReviewedOn, r.ReviewCount, r.NextReviewOn <= today)
                : null);
    }

    public async Task<TopicProgressDto> UpdateProgressAsync(int id, UpdateTopicProgressRequest request, CancellationToken ct)
    {
        if (!await db.Topics.AnyAsync(t => t.Id == id, ct)) throw new NotFoundException("Topic", id);

        var progress = await db.TopicProgress.FindAsync([id], ct);
        if (progress is null)
        {
            progress = new TopicProgress { TopicId = id };
            db.TopicProgress.Add(progress);
        }

        var now = clock.GetUtcNow().UtcDateTime;
        var status = request.Status!.Value;
        progress.Status = status;
        progress.Knowledge = request.Knowledge!.Value;
        progress.Confidence = request.Confidence;

        switch (status)
        {
            case TopicStatus.NotStarted:
                progress.StartedAt = null;
                progress.CompletedAt = null;
                break;
            case TopicStatus.InProgress:
                progress.StartedAt ??= now;
                progress.CompletedAt = null;
                break;
            case TopicStatus.Completed:
            case TopicStatus.Skipped:
                progress.StartedAt ??= now;
                progress.CompletedAt ??= now;
                break;
        }
        progress.UpdatedAt = now;

        await db.SaveChangesAsync(ct);
        return new TopicProgressDto(id, progress.Status, progress.Knowledge, progress.Confidence,
            progress.StartedAt, progress.CompletedAt, progress.UpdatedAt);
    }

    private DateOnly Today() => DateOnly.FromDateTime(clock.GetLocalNow().DateTime);

    internal static TopicSummaryDto ToSummary(TopicState t, LearningState state, string summaryEn, string summaryAr, bool inReview) =>
        new(t.Id, t.Slug, t.PhaseId, t.Order, t.Skill, t.Priority, t.Minutes, t.TitleEn, t.TitleAr,
            summaryEn, summaryAr, t.Status, t.Knowledge, t.Confidence, inReview, state.PrerequisitesMet(t));
}
