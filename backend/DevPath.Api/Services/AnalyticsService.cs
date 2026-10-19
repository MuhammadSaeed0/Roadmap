using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DevPath.Api.Services;

public class AnalyticsService(
    AppDbContext db, LearningStateLoader stateLoader, ProjectService projects, PracticeService practice,
    RecommendationService recommendations, ReviewService reviews, PreferenceService preferences,
    IOptions<ProgressOptions> options, TimeProvider clock)
{
    private DateOnly Today() => DateOnly.FromDateTime(clock.GetLocalNow().DateTime);

    public async Task<ProgressReportDto> GetReportAsync(CancellationToken ct)
    {
        var state = await stateLoader.LoadAsync(ct);
        var opts = options.Value;
        var pref = await preferences.GetEntityAsync(ct);
        var today = Today();
        var thisWeek = PreferenceService.WeekStart(today, pref.WeekStartsOn);
        var firstWeek = thisWeek.AddDays(-7 * 7);

        var sessions = await db.StudySessions.AsNoTracking()
            .Select(s => new { s.SessionDate, s.ActualMinutes })
            .ToListAsync(ct);

        var weekly = Enumerable.Range(0, 8)
            .Select(i => firstWeek.AddDays(7 * i))
            .Select(start => new WeekMinutesDto(start,
                sessions.Where(s => s.SessionDate >= start && s.SessionDate < start.AddDays(7)).Sum(s => s.ActualMinutes)))
            .ToList();

        var projectSummaries = await projects.GetSummariesAsync(ct);
        var practiceStats = (await practice.ListAsync(null, null, null, ct)).Stats;

        var interviewRatings = await db.InterviewQuestions.AsNoTracking()
            .Select(q => q.Progress != null ? (InterviewRating?)q.Progress.Rating : null)
            .ToListAsync(ct);
        var interview = new InterviewStatsDto(interviewRatings.Count,
            interviewRatings.Count(r => r == InterviewRating.Confident),
            interviewRatings.Count(r => r == InterviewRating.Partial),
            interviewRatings.Count(r => r == InterviewRating.NeedReview),
            interviewRatings.Count(r => r == null));

        return new ProgressReportDto(
            ProgressCalculator.Overall(state, opts),
            new FormulaDto(opts.SkillWeights, opts.PriorityWeights),
            ProgressCalculator.BySkill(state, opts),
            ProgressCalculator.ByPhase(state, opts),
            ProgressCalculator.ConfidenceDistribution(state),
            projectSummaries, practiceStats, interview, weekly,
            await AchievementsAsync(state, sessions.Sum(s => s.ActualMinutes), ct),
            ProgressCalculator.WeakAreas(state),
            sessions.Sum(s => s.ActualMinutes));
    }

    /// <summary>Achievements are derived from existing data — nothing extra is stored.</summary>
    private async Task<IReadOnlyList<AchievementDto>> AchievementsAsync(LearningState state, int totalMinutes, CancellationToken ct)
    {
        var list = new List<AchievementDto>();
        var done = state.Topics.Where(t => t.IsDone && t.CompletedAt != null).OrderBy(t => t.CompletedAt).ToList();

        foreach (var n in new[] { 1, 10, 25, 50, 100 })
            if (done.Count >= n)
                list.Add(new AchievementDto("topicsDone", new Dictionary<string, string> { ["count"] = n.ToString() }, done[n - 1].CompletedAt));

        foreach (var phase in state.Phases)
        {
            var topics = state.Topics.Where(t => t.PhaseId == phase.Id).ToList();
            if (topics.Count > 0 && topics.All(t => t.IsDone))
                list.Add(new AchievementDto("phaseDone",
                    new Dictionary<string, string> { ["en"] = phase.TitleEn, ["ar"] = phase.TitleAr },
                    topics.Max(t => t.CompletedAt)));
        }

        var milestones = await db.ProjectMilestones.AsNoTracking()
            .Select(m => new
            {
                m.TitleEn, m.TitleAr, ProjectEn = m.Project.TitleEn, ProjectAr = m.Project.TitleAr,
                Total = m.Tasks.Count(t => !t.IsChangeRequest),
                Done = m.Tasks.Count(t => !t.IsChangeRequest && t.Progress != null && t.Progress.Status == ProjectTaskStatus.Completed),
                Last = m.Tasks.Max(t => t.Progress != null ? t.Progress.CompletedAt : null)
            })
            .ToListAsync(ct);
        foreach (var m in milestones.Where(m => m.Total > 0 && m.Done == m.Total))
            list.Add(new AchievementDto("milestoneDone",
                new Dictionary<string, string> { ["en"] = m.TitleEn, ["ar"] = m.TitleAr, ["projectEn"] = m.ProjectEn, ["projectAr"] = m.ProjectAr },
                m.Last));

        var exerciseDates = await db.PracticeProgress.AsNoTracking()
            .Where(p => p.CompletedAt != null).OrderBy(p => p.CompletedAt).Select(p => p.CompletedAt).ToListAsync(ct);
        foreach (var n in new[] { 1, 5, 10, 25 })
            if (exerciseDates.Count >= n)
                list.Add(new AchievementDto("exercisesDone", new Dictionary<string, string> { ["count"] = n.ToString() }, exerciseDates[n - 1]));

        foreach (var hours in new[] { 5, 10, 25, 50, 100 })
            if (totalMinutes >= hours * 60)
                list.Add(new AchievementDto("studyHours", new Dictionary<string, string> { ["hours"] = hours.ToString() }, null));

        // Most recent first; undated ones (study hours) at the top of their group.
        return list.OrderByDescending(a => a.At ?? DateTime.MaxValue).Take(12).ToList();
    }

    public async Task<WeeklyReviewDto> GetWeeklyAsync(DateOnly? weekOf, CancellationToken ct)
    {
        var pref = await preferences.GetEntityAsync(ct);
        var start = PreferenceService.WeekStart(weekOf ?? Today(), pref.WeekStartsOn);
        var end = start.AddDays(6);
        var tz = clock.LocalTimeZone;
        DateTime ToUtc(DateOnly d) => TimeZoneInfo.ConvertTimeToUtc(d.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified), tz);
        var fromUtc = ToUtc(start);
        var toUtc = ToUtc(end.AddDays(1));

        var sessions = await db.StudySessions.AsNoTracking()
            .Where(s => s.SessionDate >= start.AddDays(-7) && s.SessionDate <= end)
            .Select(s => new { s.SessionDate, s.ActualMinutes })
            .ToListAsync(ct);
        var thisWeek = sessions.Where(s => s.SessionDate >= start).ToList();

        var topics = await db.TopicProgress.AsNoTracking()
            .Where(p => p.CompletedAt >= fromUtc && p.CompletedAt < toUtc)
            .OrderBy(p => p.CompletedAt)
            .Select(p => new TopicRefDto(p.TopicId, p.Topic.Slug, p.Topic.TitleEn, p.Topic.TitleAr, p.Topic.Skill, p.Status))
            .ToListAsync(ct);

        var tasks = await db.ProjectTaskProgress.AsNoTracking()
            .Where(p => p.CompletedAt >= fromUtc && p.CompletedAt < toUtc)
            .Select(p => new TaskRefDto(p.ProjectTaskId, p.ProjectTask.Milestone.ProjectId, p.ProjectTask.TitleEn, p.ProjectTask.TitleAr,
                p.ProjectTask.Milestone.Project.TitleEn, p.ProjectTask.Milestone.Project.TitleAr))
            .ToListAsync(ct);

        var exercises = await db.PracticeProgress.CountAsync(p => p.CompletedAt >= fromUtc && p.CompletedAt < toUtc, ct);
        var questions = await db.InterviewProgress.CountAsync(p => p.LastPracticedAt >= fromUtc && p.LastPracticedAt < toUtc, ct);

        var state = await stateLoader.LoadAsync(ct);
        var weak = ProgressCalculator.WeakAreas(state, 6);
        var minutes = thisWeek.Sum(s => s.ActualMinutes);

        // Suggested priorities for next week — each is a reason code the UI translates.
        var suggestions = new List<ReasonDto>();
        var goal = pref.DailyGoalMinutes * 5;
        if (minutes < goal)
            suggestions.Add(new ReasonDto("studyMore", new Dictionary<string, string> { ["goal"] = goal.ToString(), ["minutes"] = minutes.ToString() }));
        var due = await reviews.CountDueAsync(ct);
        if (due > 0) suggestions.Add(new ReasonDto("clearReviews", new Dictionary<string, string> { ["count"] = due.ToString() }));
        if (weak.Count > 0) suggestions.Add(new ReasonDto("reviewWeak", new Dictionary<string, string> { ["count"] = weak.Count.ToString() }));
        var blocked = (await projects.GetSummariesAsync(ct)).Sum(p => p.BlockedTasks);
        if (blocked > 0) suggestions.Add(new ReasonDto("unblockTasks", new Dictionary<string, string> { ["count"] = blocked.ToString() }));
        var next = (await recommendations.RankAsync(state, null, ct)).FirstOrDefault();
        if (next is not null)
            suggestions.Add(new ReasonDto("nextTopic", new Dictionary<string, string>
                { ["en"] = next.Topic.TitleEn, ["ar"] = next.Topic.TitleAr, ["topicId"] = next.Topic.Id.ToString() }));
        var nextTask = await projects.GetNextTaskAsync(ct);
        if (nextTask is { } nt)
            suggestions.Add(new ReasonDto("projectTask", new Dictionary<string, string>
                { ["en"] = nt.Task.TitleEn, ["ar"] = nt.Task.TitleAr, ["projectId"] = nt.Project.Id.ToString() }));
        var needReview = await db.InterviewProgress.CountAsync(p => p.Rating == InterviewRating.NeedReview, ct);
        if (needReview > 0) suggestions.Add(new ReasonDto("interviewReview", new Dictionary<string, string> { ["count"] = needReview.ToString() }));

        var days = Enumerable.Range(0, 7).Select(i => start.AddDays(i))
            .Select(d => new DailyMinutesDto(d, thisWeek.Where(s => s.SessionDate == d).Sum(s => s.ActualMinutes)))
            .ToList();

        return new WeeklyReviewDto(start, end, topics, minutes,
            sessions.Where(s => s.SessionDate < start).Sum(s => s.ActualMinutes),
            thisWeek.Count, tasks, exercises, questions, weak, suggestions.Take(6).ToList(), days);
    }
}
