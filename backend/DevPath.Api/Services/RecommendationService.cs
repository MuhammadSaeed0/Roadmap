using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

public class RecommendationService(
    AppDbContext db, LearningStateLoader stateLoader, ProjectService projects, PreferenceService preferences)
{
    public async Task<IReadOnlyList<RecommendationDto>> GetAsync(int? minutes, int take, CancellationToken ct)
    {
        var state = await stateLoader.LoadAsync(ct);
        var ranked = await RankAsync(state, minutes, ct);
        return await ToDtosAsync(state, ranked.Take(Math.Clamp(take, 1, 10)).ToList(), ct);
    }

    internal async Task<IReadOnlyList<ScoredTopic>> RankAsync(LearningState state, int? minutes, CancellationToken ct)
    {
        var pref = await preferences.GetEntityAsync(ct);
        var needs = await projects.GetProjectNeedsAsync(ct);
        return RecommendationEngine.Rank(new RecommendationInput(state, needs, pref.AllowSkippingPrerequisites, pref.FocusSkill, minutes));
    }

    internal async Task<IReadOnlyList<RecommendationDto>> ToDtosAsync(LearningState state, IReadOnlyList<ScoredTopic> items, CancellationToken ct)
    {
        var ids = items.Select(i => i.Topic.Id).ToList();
        var extras = await db.Topics.AsNoTracking().Where(t => ids.Contains(t.Id))
            .Select(t => new { t.Id, t.SummaryEn, t.SummaryAr, InReview = t.ReviewSchedule != null })
            .ToDictionaryAsync(t => t.Id, ct);
        var phases = state.Phases.ToDictionary(p => p.Id);

        return items.Select(i => new RecommendationDto(
            TopicService.ToSummary(i.Topic, state, extras[i.Topic.Id].SummaryEn, extras[i.Topic.Id].SummaryAr, extras[i.Topic.Id].InReview),
            ProgressCalculator.ToRef(phases[i.Topic.PhaseId]),
            i.Score, i.Reasons)).ToList();
    }
}

/// <summary>
/// Builds a short, realistic study session for 30, 60 or 120 minutes from what you
/// haven't finished yet. Each template splits the time into activities; activities
/// that have nothing to point at (e.g. no reviews due) fall back to learning.
/// </summary>
public class StudyPlanService(
    AppDbContext db, LearningStateLoader stateLoader, RecommendationService recommendations,
    ProjectService projects, TimeProvider clock)
{
    // (kind, share of the total time)
    private static readonly (string Kind, double Share)[] Short = [("learn", 0.5), ("practice", 0.33), ("interview", 0.17)];
    private static readonly (string Kind, double Share)[] Medium = [("learn", 0.35), ("practice", 0.4), ("challenge", 0.25)];
    private static readonly (string Kind, double Share)[] Long =
        [("review", 0.1), ("learn", 0.3), ("practice", 0.25), ("project", 0.25), ("interview", 0.1)];

    public async Task<StudyPlanDto> BuildAsync(int minutes, CancellationToken ct)
    {
        var template = minutes <= 45 ? Short : minutes <= 90 ? Medium : Long;
        var state = await stateLoader.LoadAsync(ct);
        var ranked = await recommendations.RankAsync(state, null, ct);
        var topic = ranked.FirstOrDefault()?.Topic;

        // Split the time in 5-minute steps; the last activity absorbs rounding.
        var durations = template.Select(t => Math.Max(5, (int)Math.Round(minutes * t.Share / 5) * 5)).ToArray();
        durations[^1] = Math.Max(5, minutes - durations[..^1].Sum());

        var items = new List<StudyPlanItemDto>();
        for (var i = 0; i < template.Length; i++)
        {
            var item = await BuildItemAsync(template[i].Kind, durations[i], topic, ranked, ct);
            if (item is not null) items.Add(item);
        }

        // Merge consecutive duplicates (e.g. two "learn" blocks for the same topic after a fallback).
        var merged = new List<StudyPlanItemDto>();
        foreach (var item in items)
        {
            if (merged.Count > 0 && merged[^1].Kind == item.Kind && merged[^1].TopicId == item.TopicId && merged[^1].ExerciseId == item.ExerciseId)
                merged[^1] = merged[^1] with { Minutes = merged[^1].Minutes + item.Minutes };
            else
                merged.Add(item);
        }
        return new StudyPlanDto(minutes, merged);
    }

    private async Task<StudyPlanItemDto?> BuildItemAsync(
        string kind, int minutes, TopicState? topic, IReadOnlyList<ScoredTopic> ranked, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(clock.GetLocalNow().DateTime);
        StudyPlanItemDto? Learn(TopicState? t) =>
            t is null ? null : new StudyPlanItemDto("learn", minutes, t.TitleEn, t.TitleAr, TopicId: t.Id);

        switch (kind)
        {
            case "learn":
                return Learn(topic);

            case "practice":
            {
                if (topic is null) return null;
                // Prefer a coding exercise (enum order) — sorted in memory because enums are stored as strings.
                var exercise = (await db.PracticeExercises.AsNoTracking()
                    .Where(e => e.TopicId == topic.Id && (e.Progress == null || e.Progress.Status != PracticeStatus.Completed))
                    .Select(e => new { e.Id, e.Type, e.TitleEn, e.TitleAr })
                    .ToListAsync(ct))
                    .OrderBy(e => e.Type).ThenBy(e => e.Id)
                    .FirstOrDefault();
                return exercise is not null
                    ? new StudyPlanItemDto("exercise", minutes, exercise.TitleEn, exercise.TitleAr, TopicId: topic.Id, ExerciseId: exercise.Id)
                    : new StudyPlanItemDto("practice", minutes, topic.TitleEn, topic.TitleAr, TopicId: topic.Id);
            }

            case "challenge":
                return topic is null ? null : new StudyPlanItemDto("challenge", minutes, topic.TitleEn, topic.TitleAr, TopicId: topic.Id);

            case "review":
            {
                var due = await db.ReviewSchedules.AsNoTracking()
                    .Where(r => r.NextReviewOn <= today)
                    .OrderBy(r => r.NextReviewOn)
                    .Select(r => new { r.TopicId, r.Topic.TitleEn, r.Topic.TitleAr })
                    .FirstOrDefaultAsync(ct);
                if (due is not null) return new StudyPlanItemDto("review", minutes, due.TitleEn, due.TitleAr, TopicId: due.TopicId);
                // Nothing due: learn the second-best topic instead.
                return Learn(ranked.Skip(1).FirstOrDefault()?.Topic ?? topic);
            }

            case "project":
            {
                var next = await projects.GetNextTaskAsync(ct);
                if (next is { } n)
                    return new StudyPlanItemDto("project", minutes, n.Task.TitleEn, n.Task.TitleAr,
                        ProjectId: n.Project.Id, ProjectTaskId: n.Task.Id);
                return Learn(topic);
            }

            case "interview":
            {
                var skill = topic?.Skill ?? SkillArea.CSharp;
                var category = CategoryFor(skill);
                return new StudyPlanItemDto("interview", minutes, category.ToString(), category.ToString(),
                    TopicId: topic?.Id, InterviewCategory: category);
            }
        }
        return null;
    }

    public static InterviewCategory CategoryFor(SkillArea skill) => skill switch
    {
        SkillArea.CSharp => InterviewCategory.CSharp,
        SkillArea.AspNetCore => InterviewCategory.AspNetCore,
        SkillArea.EfCore => InterviewCategory.EfCore,
        SkillArea.SqlServer => InterviewCategory.SqlServer,
        SkillArea.TypeScript => InterviewCategory.TypeScript,
        SkillArea.Angular => InterviewCategory.Angular,
        SkillArea.Testing => InterviewCategory.Testing,
        SkillArea.Git => InterviewCategory.Git,
        _ => InterviewCategory.FullStackDesign
    };
}
