using DevPath.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Removes rows that point at a discussion, a reply or an account through foreign keys the database can't cascade
/// (SQL Server allows only one cascade path into a table). Run inside the caller's transaction, before the delete.
///
/// Votes are per-user rows (filtered to the signed-in account), so they are deleted with the filter ignored:
/// everyone's votes on the post go with it.
/// </summary>
public static class SharedRowCleanup
{
    public static async Task BeforeDeletingDiscussionAsync(AppDbContext db, int discussionId, CancellationToken ct)
    {
        var replyIds = db.DiscussionReplies.Where(r => r.DiscussionId == discussionId).Select(r => r.Id);
        await db.Discussions.Where(d => d.Id == discussionId).ExecuteUpdateAsync(s => s.SetProperty(d => d.AcceptedReplyId, (int?)null), ct);
        await db.DiscussionVotes.IgnoreQueryFilters()
            .Where(v => v.DiscussionId == discussionId || (v.ReplyId != null && replyIds.Contains(v.ReplyId.Value)))
            .ExecuteDeleteAsync(ct);
        await db.Notifications.Where(n => n.DiscussionId == discussionId).ExecuteDeleteAsync(ct);
    }

    public static async Task BeforeDeletingReplyAsync(AppDbContext db, int replyId, CancellationToken ct)
    {
        await db.Discussions.Where(d => d.AcceptedReplyId == replyId).ExecuteUpdateAsync(s => s.SetProperty(d => d.AcceptedReplyId, (int?)null), ct);
        await db.DiscussionVotes.IgnoreQueryFilters().Where(v => v.ReplyId == replyId).ExecuteDeleteAsync(ct);
    }

    /// <summary>Posts stay (their author becomes "deleted user"); private paths and the account's place in others' notifications go.</summary>
    public static async Task BeforeDeletingAccountAsync(AppDbContext db, string userId, CancellationToken ct)
    {
        await db.Notifications.Where(n => n.ActorId == userId).ExecuteUpdateAsync(s => s.SetProperty(n => n.ActorId, (string?)null), ct);
        var ownPaths = db.LearningPaths.Where(p => p.CreatorId == userId && !p.IsBuiltIn).Select(p => p.Id);
        await db.UserLearningPaths.IgnoreQueryFilters().Where(u => ownPaths.Contains(u.LearningPathId)).ExecuteDeleteAsync(ct);
        await db.LearningPaths.Where(p => p.CreatorId == userId && !p.IsBuiltIn).ExecuteDeleteAsync(ct);
    }
}
