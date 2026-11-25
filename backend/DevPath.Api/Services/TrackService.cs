using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>The roadmaps a learner can follow, and which one they follow.</summary>
public class TrackService(AppDbContext db, ICurrentUser user, TrackContext context, TimeProvider clock)
{
    public async Task<TracksDto> ListAsync(CancellationToken ct)
    {
        var tracks = (await db.Tracks.AsNoTracking().OrderBy(t => t.Order).ToListAsync(ct))
            .Where(t => t.IsPublished || user.CanSeeDrafts).ToList();
        // Topics per phase (draft content is already filtered out for learners), and the learner's finished topics.
        var phases = await db.TrackPhases.AsNoTracking()
            .Select(tp => new { tp.TrackId, tp.PhaseId }).ToListAsync(ct);
        var topics = await db.Topics.AsNoTracking()
            .Select(t => new { t.Id, t.PhaseId, t.EstimatedMinutes }).ToListAsync(ct);
        var done = user.Id is null ? [] : (await db.TopicProgress.AsNoTracking()
                .Where(p => p.Status == TopicStatus.Completed || p.Status == TopicStatus.Skipped)
                .Select(p => p.TopicId).ToListAsync(ct)).ToHashSet();

        var active = user.Id is null ? null : await context.GetAsync(ct);
        var chosen = user.Id is null ? null : await db.UserTracks.AsNoTracking().Select(u => u.TrackSlug).SingleOrDefaultAsync(ct);
        var activePhases = active?.Positions.Keys.ToHashSet() ?? [];

        var list = tracks.Select(t =>
        {
            var phaseIds = phases.Where(p => p.TrackId == t.Id).Select(p => p.PhaseId).ToHashSet();
            var mine = topics.Where(x => phaseIds.Contains(x.PhaseId)).ToList();
            return new TrackDto(
                t.Slug, t.Order, t.TitleEn, t.TitleAr, t.SummaryEn, t.SummaryAr, t.OutcomeEn, t.OutcomeAr,
                t.Technologies.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
                t.Icon, !t.IsPublished, phaseIds.Count, mine.Count, mine.Sum(x => x.EstimatedMinutes),
                mine.Count(x => done.Contains(x.Id)),
                active is null || active.Slug == t.Slug ? 0 : phaseIds.Count(activePhases.Contains));
        }).ToList();
        return new TracksDto(list, active?.Slug, list.Any(t => t.Slug == chosen) ? chosen : null);
    }

    /// <summary>Makes <paramref name="slug"/> the learner's roadmap. Progress is per topic, so nothing is lost.</summary>
    public async Task<TracksDto> ChooseAsync(string slug, CancellationToken ct)
    {
        var track = await db.Tracks.AsNoTracking().SingleOrDefaultAsync(t => t.Slug == slug, ct);
        if (track is null || !(track.IsPublished || user.CanSeeDrafts)) throw new NotFoundException("Roadmap", slug);

        var row = await db.UserTracks.SingleOrDefaultAsync(ct);
        if (row is null) db.UserTracks.Add(row = new UserTrack { TrackSlug = slug });
        row.TrackSlug = slug;
        row.ChosenAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return await new TrackService(db, user, new TrackContext(db, user), clock).ListAsync(ct);
    }
}
