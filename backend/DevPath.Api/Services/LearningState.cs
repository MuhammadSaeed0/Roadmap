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

/// <summary>A phase. <see cref="Order"/> is its place in the whole catalog; <see cref="Position"/> its number in the roadmap.</summary>
public record PhaseState(int Id, string Slug, int Order, string TitleEn, string TitleAr, int Position = 0);

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

public class LearningStateLoader(AppDbContext db, TrackContext tracks, ContentCache cache)
{
    private record TopicRow(int Id, string Slug, int PhaseId, int PhaseOrder, int Order, SkillArea Skill, TopicPriority Priority,
        int EstimatedMinutes, string TitleEn, string TitleAr, List<int> Prereqs);

    /// <summary>
    /// The learner's active roadmap: its phases in roadmap order and their topics. With <paramref name="wholeCatalog"/>,
    /// every phase and topic the user can see instead (for pages that open any topic by id: search, topic detail).
    /// </summary>
    public async Task<LearningState> LoadAsync(CancellationToken ct, bool wholeCatalog = false)
    {
        var track = wholeCatalog ? null : await tracks.GetAsync(ct);
        // Phases and topics are catalogue content (cached); only the progress is read per request.
        var phases = await cache.GetAsync("learning-phases", db.ShowDrafts, () => db.Phases.AsNoTracking()
            .OrderBy(p => p.Order)
            .Select(p => new PhaseState(p.Id, p.Slug, p.Order, p.TitleEn, p.TitleAr))
            .ToListAsync(CancellationToken.None));

        // The signed-in user's progress (the query filter keeps other accounts' rows out).
        var progress = await db.TopicProgress.AsNoTracking()
            .Select(p => new { p.TopicId, p.Status, p.Knowledge, p.Confidence, p.CompletedAt })
            .ToDictionaryAsync(p => p.TopicId, ct);

        var rows = await cache.GetAsync("learning-topics", db.ShowDrafts, () => db.Topics.AsNoTracking()
            .OrderBy(t => t.Phase.Order).ThenBy(t => t.Order)
            .Select(t => new TopicRow(
                t.Id, t.Slug, t.PhaseId, t.Phase.Order, t.Order,
                t.Skill, t.Priority, t.EstimatedMinutes, t.TitleEn, t.TitleAr,
                t.Prerequisites.Select(p => p.PrerequisiteTopicId).ToList()))
            .AsSplitQuery()
            .ToListAsync(CancellationToken.None));

        var topics = rows.Select(r =>
        {
            var p = progress.GetValueOrDefault(r.Id);
            return new TopicState(
                r.Id, r.Slug, r.PhaseId, r.PhaseOrder, r.Order, r.Skill, r.Priority, r.EstimatedMinutes, r.TitleEn, r.TitleAr,
                p?.Status ?? TopicStatus.NotStarted, p?.Knowledge ?? KnowledgeLevel.Unassessed, p?.Confidence, p?.CompletedAt, r.Prereqs);
        }).ToList();

        if (track is null)
            return new LearningState(phases.Select(p => p with { Position = p.Order }).ToList(), topics);

        // Only the roadmap's phases, in its order; prerequisites outside it are dropped so nothing looks up a topic the
        // state doesn't hold (seed validation keeps them inside every roadmap anyway).
        var inTrack = phases.Where(p => track.Positions.ContainsKey(p.Id))
            .Select(p => p with { Position = track.Positions[p.Id] }).OrderBy(p => p.Position).ToList();
        var position = inTrack.ToDictionary(p => p.Id, p => p.Position);
        var trackTopics = topics.Where(t => position.ContainsKey(t.PhaseId))
            .OrderBy(t => position[t.PhaseId]).ThenBy(t => t.Order).ToList();
        var ids = trackTopics.Select(t => t.Id).ToHashSet();
        return new LearningState(inTrack,
            trackTopics.Select(t => t with { PrerequisiteIds = t.PrerequisiteIds.Where(ids.Contains).ToList() }).ToList());
    }
}
