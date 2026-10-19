using DevPath.Api.DTOs;
using DevPath.Api.Models;

namespace DevPath.Api.Services;

public record ProjectNeed(int ProjectId, string TitleEn, string TitleAr);

public record RecommendationInput(
    LearningState State,
    /// <summary>Topic id → the active/upcoming project that needs it for an unfinished task.</summary>
    IReadOnlyDictionary<int, ProjectNeed> ProjectNeeds,
    bool AllowSkippingPrerequisites,
    SkillArea? FocusSkill,
    int? AvailableMinutes);

public record ScoredTopic(TopicState Topic, double Score, IReadOnlyList<ReasonDto> Reasons);

/// <summary>
/// "What should I study next?" — a deterministic, explainable scoring algorithm.
/// No AI involved: every point added or removed comes with a reason code that the UI
/// shows to you, so you can always see WHY a topic was recommended.
///
/// Eligibility: the topic is not done, and its prerequisites are done
/// (unless you enabled "allow skipping prerequisites" in Settings).
/// </summary>
public static class RecommendationEngine
{
    // The scoring table. Tweak these to change the behaviour.
    public const double InProgressBonus = 40;
    public const double CurrentPhaseBonus = 30;
    public const double EarlierPhaseBonus = 20;     // a topic left behind in an earlier phase
    public const double LaterPhasePenaltyPerStep = 6;
    public const double CoreBonus = 20;
    public const double ImportantBonus = 10;
    public const double NeedToLearnBonus = 12;
    public const double NeedReviewBonus = 6;
    public const double AlreadyKnowPenalty = 40;
    public const double LowConfidenceBonus = 6;
    public const double ProjectBonus = 18;
    public const double UnlockBonusPerTopic = 3;
    public const double UnlockBonusCap = 12;
    public const double FocusSkillBonus = 15;
    public const double FitsTimeBonus = 5;
    public const double TooLongPenalty = 20;
    public const double SkippedPrerequisitePenalty = 15;

    public static IReadOnlyList<ScoredTopic> Rank(RecommendationInput input)
    {
        var state = input.State;
        var current = ProgressCalculator.CurrentPhase(state);
        var results = new List<ScoredTopic>();

        foreach (var t in state.Topics)
        {
            if (t.IsDone) continue;

            var prereqsMet = state.PrerequisitesMet(t);
            if (!prereqsMet && !input.AllowSkippingPrerequisites) continue;

            double score = 0;
            var reasons = new List<ReasonDto>();
            void Add(double points, string code, Dictionary<string, string>? p = null)
            {
                score += points;
                if (points > 0 || code.StartsWith('!')) reasons.Add(new ReasonDto(code.TrimStart('!'), p));
            }

            if (t.Status == TopicStatus.InProgress) Add(InProgressBonus, "inProgress");

            if (current is not null)
            {
                if (t.PhaseId == current.Id) Add(CurrentPhaseBonus, "currentPhase");
                else if (t.PhaseOrder < current.Order) Add(EarlierPhaseBonus, "earlierPhase");
                else score -= LaterPhasePenaltyPerStep * (t.PhaseOrder - current.Order);
            }

            switch (t.Priority)
            {
                case TopicPriority.Core: Add(CoreBonus, "corePriority"); break;
                case TopicPriority.Important: Add(ImportantBonus, "importantPriority"); break;
            }

            switch (t.Knowledge)
            {
                case KnowledgeLevel.NeedToLearn: Add(NeedToLearnBonus, "knowledgeGap"); break;
                case KnowledgeLevel.NeedReview: Add(NeedReviewBonus, "needsReview"); break;
                case KnowledgeLevel.AlreadyKnow: score -= AlreadyKnowPenalty; break;
            }

            if (t.Confidence is <= 2) Add(LowConfidenceBonus, "lowConfidence");

            if (input.ProjectNeeds.TryGetValue(t.Id, out var need))
                Add(ProjectBonus, "neededForProject", new() { ["projectEn"] = need.TitleEn, ["projectAr"] = need.TitleAr, ["projectId"] = need.ProjectId.ToString() });

            var unlocks = state.Dependents.GetValueOrDefault(t.Id, []).Count(id => !state.ById[id].IsDone);
            if (unlocks > 0)
            {
                var points = Math.Min(UnlockBonusCap, unlocks * UnlockBonusPerTopic);
                if (unlocks >= 2) Add(points, "unlocks", new() { ["count"] = unlocks.ToString() });
                else score += points;
            }

            if (input.FocusSkill == t.Skill) Add(FocusSkillBonus, "focusSkill");

            if (input.AvailableMinutes is { } available)
            {
                if (t.Minutes <= available) Add(FitsTimeBonus, "fitsTime", new() { ["minutes"] = t.Minutes.ToString() });
                else score -= TooLongPenalty;
            }

            if (!prereqsMet) Add(-SkippedPrerequisitePenalty, "!prerequisitesSkipped");

            results.Add(new ScoredTopic(t, score, reasons));
        }

        // Deterministic ordering: score, then roadmap order.
        return results
            .OrderByDescending(r => r.Score)
            .ThenBy(r => r.Topic.PhaseOrder)
            .ThenBy(r => r.Topic.Order)
            .ToList();
    }
}
