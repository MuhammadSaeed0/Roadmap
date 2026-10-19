using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DevPath.Api.Services;

public class DashboardService(
    AppDbContext db, LearningStateLoader stateLoader, RecommendationService recommendations,
    ProjectService projects, ReviewService reviews, PreferenceService preferences,
    IOptions<ProgressOptions> options, TimeProvider clock)
{
    public async Task<DashboardDto> GetAsync(CancellationToken ct)
    {
        var state = await stateLoader.LoadAsync(ct);
        var pref = await preferences.GetEntityAsync(ct);
        var ranked = await recommendations.RankAsync(state, null, ct);
        var top = ranked.Count > 0 ? (await recommendations.ToDtosAsync(state, [ranked[0]], ct))[0] : null;

        var today = DateOnly.FromDateTime(clock.GetLocalNow().DateTime);
        var weekStart = PreferenceService.WeekStart(today, pref.WeekStartsOn);
        var sessionDays = await db.StudySessions.AsNoTracking()
            .Where(s => s.SessionDate >= today.AddDays(-400))
            .GroupBy(s => s.SessionDate)
            .Select(g => new { Date = g.Key, Minutes = g.Sum(s => s.ActualMinutes) })
            .ToListAsync(ct);

        return new DashboardDto(
            ProgressCalculator.Overall(state, options.Value),
            top,
            await projects.GetSummariesAsync(ct),
            ProgressCalculator.BySkill(state, options.Value),
            await RecentActivityAsync(ct),
            await reviews.CountDueAsync(ct),
            sessionDays.Where(d => d.Date >= weekStart && d.Date <= today).Sum(d => d.Minutes),
            Streak(sessionDays.Select(d => d.Date).ToHashSet(), today),
            pref.DailyGoalMinutes,
            sessionDays.Where(d => d.Date == today).Sum(d => d.Minutes));
    }

    /// <summary>Consecutive days with at least one study session, ending today (or yesterday).</summary>
    public static int Streak(IReadOnlySet<DateOnly> days, DateOnly today)
    {
        var day = days.Contains(today) ? today : today.AddDays(-1);
        var streak = 0;
        while (days.Contains(day)) { streak++; day = day.AddDays(-1); }
        return streak;
    }

    private async Task<IReadOnlyList<ActivityDto>> RecentActivityAsync(CancellationToken ct)
    {
        const int take = 8;
        var topics = await db.TopicProgress.AsNoTracking()
            .Where(p => p.CompletedAt != null)
            .OrderByDescending(p => p.CompletedAt).Take(take)
            .Select(p => new ActivityDto(p.Status == TopicStatus.Skipped ? "topicSkipped" : "topicCompleted",
                p.Topic.TitleEn, p.Topic.TitleAr, p.CompletedAt!.Value, p.TopicId, null, null))
            .ToListAsync(ct);

        var notes = await db.Notes.AsNoTracking()
            .OrderByDescending(n => n.UpdatedAt).Take(take)
            .Select(n => new ActivityDto(n.CreatedAt == n.UpdatedAt ? "noteCreated" : "noteUpdated",
                n.Title, n.Title, n.UpdatedAt, n.Id, null, null))
            .ToListAsync(ct);

        var exercises = await db.PracticeProgress.AsNoTracking()
            .Where(p => p.CompletedAt != null)
            .OrderByDescending(p => p.CompletedAt).Take(take)
            .Select(p => new ActivityDto("exerciseCompleted", p.Exercise.TitleEn, p.Exercise.TitleAr, p.CompletedAt!.Value, p.ExerciseId, null, null))
            .ToListAsync(ct);

        var tasks = await db.ProjectTaskProgress.AsNoTracking()
            .Where(p => p.CompletedAt != null)
            .OrderByDescending(p => p.CompletedAt).Take(take)
            .Select(p => new ActivityDto("taskCompleted", p.ProjectTask.TitleEn, p.ProjectTask.TitleAr, p.CompletedAt!.Value,
                p.ProjectTaskId, p.ProjectTask.Milestone.ProjectId, null))
            .ToListAsync(ct);

        var sessions = await db.StudySessions.AsNoTracking()
            .OrderByDescending(s => s.CreatedAt).Take(take)
            .Select(s => new ActivityDto("studySession",
                s.Topic != null ? s.Topic.TitleEn : s.ProjectTask != null ? s.ProjectTask.TitleEn : "",
                s.Topic != null ? s.Topic.TitleAr : s.ProjectTask != null ? s.ProjectTask.TitleAr : "",
                s.CreatedAt, s.TopicId, null, s.ActualMinutes))
            .ToListAsync(ct);

        return topics.Concat(notes).Concat(exercises).Concat(tasks).Concat(sessions)
            .OrderByDescending(a => a.At).Take(10).ToList();
    }
}
