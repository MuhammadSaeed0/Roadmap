using DevPath.Api.Data;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// The one rule for a finished phase, shared by the profile badges and the certificates: every topic of the
/// phase is Completed or Skipped (skipped = already known). A phase without topics is never finished.
/// </summary>
public static class PhaseCompletion
{
    /// <summary>The ids of the phases this account has finished. Reads across accounts, so it filters on the id explicitly.</summary>
    public static async Task<HashSet<int>> FinishedPhaseIdsAsync(AppDbContext db, string userId, CancellationToken ct)
    {
        var doneTopics = (await db.TopicProgress.IgnoreQueryFilters()
            .Where(p => p.UserId == userId && (p.Status == TopicStatus.Completed || p.Status == TopicStatus.Skipped))
            .Select(p => p.TopicId).ToListAsync(ct)).ToHashSet();
        var phaseTopics = await db.Topics.AsNoTracking().Select(t => new { t.Id, t.PhaseId }).ToListAsync(ct);
        return phaseTopics.GroupBy(t => t.PhaseId)
            .Where(g => g.All(t => doneTopics.Contains(t.Id))).Select(g => g.Key).ToHashSet();
    }
}
