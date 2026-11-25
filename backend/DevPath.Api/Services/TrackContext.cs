using DevPath.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>The roadmap a request works in: its id, slug and each of its phases' position ("Phase N").</summary>
public record ActiveTrack(int Id, string Slug, string TitleEn, string TitleAr, IReadOnlyDictionary<int, int> Positions);

/// <summary>
/// Resolves the signed-in learner's roadmap once per request: the one they chose if they can still see it, otherwise
/// the first published roadmap. Null when no roadmaps are seeded, in which case every phase is shown in order.
/// </summary>
public class TrackContext(AppDbContext db, ICurrentUser user)
{
    private Task<ActiveTrack?>? _track;

    public Task<ActiveTrack?> GetAsync(CancellationToken ct) => _track ??= LoadAsync(ct);

    /// <summary>
    /// The topics of the learner's roadmap, for lists that show "this roadmap" by default (practice, interviews,
    /// projects, videos, resources, glossary). Null means no filter: <paramref name="everyRoadmap"/> was asked, or
    /// there are no roadmaps.
    /// </summary>
    public async Task<IReadOnlySet<int>?> TopicIdsAsync(bool everyRoadmap, CancellationToken ct)
    {
        if (everyRoadmap || await GetAsync(ct) is not { } track) return null;
        var phases = track.Positions.Keys.ToList();
        return (await db.Topics.AsNoTracking().Where(t => phases.Contains(t.PhaseId)).Select(t => t.Id).ToListAsync(ct)).ToHashSet();
    }

    private async Task<ActiveTrack?> LoadAsync(CancellationToken ct)
    {
        var tracks = (await db.Tracks.AsNoTracking().OrderBy(t => t.Order)
                .Select(t => new { t.Id, t.Slug, t.TitleEn, t.TitleAr, t.IsPublished,
                    Phases = t.Phases.Select(p => new { p.PhaseId, p.Position }).ToList() })
                .ToListAsync(ct))
            .Where(t => t.IsPublished || user.CanSeeDrafts).ToList();
        if (tracks.Count == 0) return null;

        var chosen = user.Id is null ? null : await db.UserTracks.AsNoTracking().Select(u => u.TrackSlug).SingleOrDefaultAsync(ct);
        var track = tracks.FirstOrDefault(t => t.Slug == chosen) ?? tracks.FirstOrDefault(t => t.IsPublished) ?? tracks[0];
        return new ActiveTrack(track.Id, track.Slug, track.TitleEn, track.TitleAr, track.Phases.ToDictionary(p => p.PhaseId, p => p.Position));
    }
}
