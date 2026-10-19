using DevPath.Api.DTOs;
using DevPath.Api.Models;

namespace DevPath.Api.Services;

/// <summary>
/// Pure functions for progress. Nothing here touches the database, which keeps the
/// rules transparent and unit-testable. See ProgressOptions for the weight formula.
/// </summary>
public static class ProgressCalculator
{
    public static double WeightedPercent(IEnumerable<TopicState> topics, ProgressOptions options)
    {
        double total = 0, done = 0;
        foreach (var t in topics)
        {
            var w = options.WeightOf(t.Skill, t.Priority);
            total += w;
            if (t.IsDone) done += w;
        }
        return total == 0 ? 0 : Math.Round(done / total * 100, 1);
    }

    /// <summary>
    /// The phase you are "in": the first phase that still has an unfinished Core topic.
    /// Falls back to the first phase with any unfinished topic.
    /// </summary>
    public static PhaseState? CurrentPhase(LearningState state)
    {
        var byPhase = state.Topics.ToLookup(t => t.PhaseId);
        return state.Phases.FirstOrDefault(p => byPhase[p.Id].Any(t => !t.IsDone && t.Priority == TopicPriority.Core))
            ?? state.Phases.FirstOrDefault(p => byPhase[p.Id].Any(t => !t.IsDone));
    }

    public static OverallProgressDto Overall(LearningState state, ProgressOptions options)
    {
        var done = state.Topics.Count(t => t.IsDone);
        var current = CurrentPhase(state);
        return new OverallProgressDto(
            WeightedPercent(state.Topics, options),
            done,
            state.Topics.Count - done,
            state.Topics.Count,
            state.Topics.Where(t => !t.IsDone).Sum(t => t.Status == TopicStatus.InProgress ? t.Minutes / 2 : t.Minutes),
            current is null ? null : ToRef(current));
    }

    public static IReadOnlyList<SkillProgressDto> BySkill(LearningState state, ProgressOptions options) =>
        Enum.GetValues<SkillArea>()
            .Select(skill =>
            {
                var topics = state.Topics.Where(t => t.Skill == skill).ToList();
                var rated = topics.Where(t => t.Confidence.HasValue).ToList();
                return new SkillProgressDto(
                    skill,
                    WeightedPercent(topics, options),
                    topics.Count(t => t.IsDone),
                    topics.Count,
                    rated.Count == 0 ? null : Math.Round(rated.Average(t => t.Confidence!.Value), 1),
                    options.SkillWeights.GetValueOrDefault(skill, 1.0));
            })
            .Where(s => s.Total > 0)
            .ToList();

    public static IReadOnlyList<PhaseProgressDto> ByPhase(LearningState state, ProgressOptions options)
    {
        var byPhase = state.Topics.ToLookup(t => t.PhaseId);
        return state.Phases
            .Where(p => byPhase[p.Id].Any())
            .Select(p => new PhaseProgressDto(
                p.Id, p.Order, p.TitleEn, p.TitleAr,
                WeightedPercent(byPhase[p.Id], options),
                byPhase[p.Id].Count(t => t.IsDone),
                byPhase[p.Id].Count()))
            .ToList();
    }

    public static IReadOnlyList<ConfidenceBucketDto> ConfidenceDistribution(LearningState state)
    {
        var buckets = new List<ConfidenceBucketDto> { new("unrated", state.Topics.Count(t => t.Confidence is null)) };
        for (var level = 0; level <= 5; level++)
        {
            var l = level;
            buckets.Add(new ConfidenceBucketDto(l.ToString(), state.Topics.Count(t => t.Confidence == l)));
        }
        return buckets;
    }

    /// <summary>
    /// Weak areas: things you finished but don't feel confident about, or flagged as gaps.
    /// </summary>
    public static IReadOnlyList<WeakTopicDto> WeakAreas(LearningState state, int take = 12) =>
        state.Topics
            .Select(t => (Topic: t, Reason:
                t.IsDone && t.Status != TopicStatus.Skipped && t.Confidence is <= 2 ? "completedLowConfidence"
                : t.Knowledge == KnowledgeLevel.NeedReview ? "markedNeedReview"
                : t.Status == TopicStatus.InProgress && t.Confidence is <= 1 ? "inProgressLowConfidence"
                : null))
            .Where(x => x.Reason != null)
            .OrderBy(x => x.Topic.Confidence ?? 0).ThenBy(x => x.Topic.PhaseOrder).ThenBy(x => x.Topic.Order)
            .Take(take)
            .Select(x => new WeakTopicDto(ToRef(x.Topic), x.Topic.Confidence, x.Reason!))
            .ToList();

    public static PhaseRefDto ToRef(PhaseState p) => new(p.Id, p.Slug, p.Order, p.TitleEn, p.TitleAr);

    public static TopicRefDto ToRef(TopicState t) => new(t.Id, t.Slug, t.TitleEn, t.TitleAr, t.Skill, t.Status);
}
