using DevPath.Api.Data;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>A lightweight, read-only view of one topic and its progress.</summary>
public record TopicState(
    int Id, string Slug, int PhaseId, int PhaseOrder, int Order,
    SkillArea Skill, TopicPriority Priority, int Minutes,
    string TitleEn, string TitleAr,
    TopicStatus Status, KnowledgeLevel Knowledge, int? Confidence,
    DateTime? CompletedAt, IReadOnlyList<int> PrerequisiteIds)
{
    /// <summary>Completed, or skipped because it's already known.</summary>
    public bool IsDone => Status is TopicStatus.Completed or TopicStatus.Skipped;
}

public record PhaseState(int Id, string Slug, int Order, string TitleEn, string TitleAr);

/// <summary>
/// Snapshot of the whole roadmap with progress. The roadmap is small (~150 topics),
/// so loading it in one query and computing progress in memory is simpler and
/// faster than many aggregate queries — and the calculations become pure functions
/// that are easy to unit-test.
/// </summary>
public class LearningState
{
    public LearningState(IReadOnlyList<PhaseState> phases, IReadOnlyList<TopicState> topics)
    {
        Phases = phases;
        Topics = topics;
        ById = topics.ToDictionary(t => t.Id);
        Dependents = topics
            .SelectMany(t => t.PrerequisiteIds.Select(p => (Prereq: p, Topic: t.Id)))
            .GroupBy(x => x.Prereq)
            .ToDictionary(g => g.Key, g => (IReadOnlyList<int>)g.Select(x => x.Topic).ToList());
    }

    public IReadOnlyList<PhaseState> Phases { get; }
    public IReadOnlyList<TopicState> Topics { get; }
    public IReadOnlyDictionary<int, TopicState> ById { get; }
    /// <summary>Prerequisite id → topics that require it.</summary>
    public IReadOnlyDictionary<int, IReadOnlyList<int>> Dependents { get; }

    public bool PrerequisitesMet(TopicState topic) =>
        topic.PrerequisiteIds.All(id => ById.TryGetValue(id, out var p) && p.IsDone);

    public IEnumerable<TopicState> MissingPrerequisites(TopicState topic) =>
        topic.PrerequisiteIds.Select(id => ById[id]).Where(p => !p.IsDone);
}

public class LearningStateLoader(AppDbContext db)
{
    public async Task<LearningState> LoadAsync(CancellationToken ct)
    {
        var phases = await db.Phases.AsNoTracking()
            .OrderBy(p => p.Order)
            .Select(p => new PhaseState(p.Id, p.Slug, p.Order, p.TitleEn, p.TitleAr))
            .ToListAsync(ct);

        // The signed-in user's progress (the query filter keeps other accounts' rows out).
        var progress = await db.TopicProgress.AsNoTracking()
            .Select(p => new { p.TopicId, p.Status, p.Knowledge, p.Confidence, p.CompletedAt })
            .ToDictionaryAsync(p => p.TopicId, ct);

        var rows = await db.Topics.AsNoTracking()
            .OrderBy(t => t.Phase.Order).ThenBy(t => t.Order)
            .Select(t => new
            {
                t.Id, t.Slug, t.PhaseId, PhaseOrder = t.Phase.Order, t.Order,
                t.Skill, t.Priority, t.EstimatedMinutes, t.TitleEn, t.TitleAr,
                Prereqs = t.Prerequisites.Select(p => p.PrerequisiteTopicId).ToList()
            })
            .AsSplitQuery()
            .ToListAsync(ct);

        var topics = rows.Select(r =>
        {
            var p = progress.GetValueOrDefault(r.Id);
            return new TopicState(
                r.Id, r.Slug, r.PhaseId, r.PhaseOrder, r.Order, r.Skill, r.Priority, r.EstimatedMinutes, r.TitleEn, r.TitleAr,
                p?.Status ?? TopicStatus.NotStarted, p?.Knowledge ?? KnowledgeLevel.Unassessed, p?.Confidence, p?.CompletedAt, r.Prereqs);
        }).ToList();

        return new LearningState(phases, topics);
    }
}
