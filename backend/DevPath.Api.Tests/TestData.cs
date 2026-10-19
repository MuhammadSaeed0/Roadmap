using DevPath.Api.Models;
using DevPath.Api.Services;

namespace DevPath.Api.Tests;

/// <summary>Builds small, hand-made learning states for pure unit tests.</summary>
internal static class TestData
{
    public static TopicState Topic(
        int id, int phase = 1, SkillArea skill = SkillArea.CSharp, TopicPriority priority = TopicPriority.Core,
        TopicStatus status = TopicStatus.NotStarted, KnowledgeLevel knowledge = KnowledgeLevel.Unassessed,
        int? confidence = null, int minutes = 30, params int[] prerequisites) =>
        new(id, $"t{id}", phase, phase, id, skill, priority, minutes, $"Topic {id}", $"موضوع {id}",
            status, knowledge, confidence, status is TopicStatus.Completed or TopicStatus.Skipped ? DateTime.UtcNow : null, prerequisites);

    public static LearningState State(params TopicState[] topics) =>
        new(topics.Select(t => t.PhaseId).Distinct().Order()
                .Select(p => new PhaseState(p, $"p{p}", p, $"Phase {p}", $"المرحلة {p}")).ToList(),
            topics);
}
