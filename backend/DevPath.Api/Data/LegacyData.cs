using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Data;

/// <summary>
/// Progress, notes and other personal data saved before accounts existed had no owner.
/// The AddAccounts migration keeps it (nothing is deleted) under a placeholder account that
/// can't sign in. It only moves to a real account when you name one explicitly:
///
///   dotnet user-secrets set "LegacyData:AssignToEmail" "you@example.com"
///
/// then restart the API once. The target account must exist and have no data of its own yet.
/// </summary>
public static class LegacyData
{
    /// <summary>The placeholder owner created by the migration. Kept in sync with 20261027191023_AddAccountsAndVideos.</summary>
    public const string UserId = "legacy-local-data";

    public static async Task<int> AssignAsync(AppDbContext db, string email, ILogger logger, CancellationToken ct = default)
    {
        if (!await db.Users.AnyAsync(u => u.Id == UserId, ct))
        {
            logger.LogInformation("LegacyData:AssignToEmail is set, but there is no data from before accounts. Nothing to do; you can remove the setting.");
            return 0;
        }
        var normalized = email.Trim().ToUpperInvariant();
        var target = await db.Users.SingleOrDefaultAsync(u => u.NormalizedEmail == normalized, ct);
        if (target is null)
        {
            logger.LogWarning("LegacyData:AssignToEmail is {Email}, but no account uses that email. Create the account first, then restart.", email);
            return 0;
        }
        if (await HasDataAsync(db, target.Id, ct))
        {
            logger.LogError("Not moving data from before accounts to {Email}: that account already has its own data. " +
                            "Use a new, empty account so nothing is overwritten.", email);
            return 0;
        }

        // All or nothing. SQL Server retries transient failures, so the transaction runs inside the execution strategy.
        var moved = await db.Database.CreateExecutionStrategy().ExecuteAsync(async () =>
        {
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            var count = 0;
            count += await Move(db.TopicProgress, target.Id, ct);
            count += await Move(db.StudySessions, target.Id, ct);
            count += await Move(db.Notes, target.Id, ct);
            count += await Move(db.ProjectTaskProgress, target.Id, ct);
            count += await Move(db.PortfolioChecks, target.Id, ct);
            count += await Move(db.ProjectRepositories, target.Id, ct);
            count += await Move(db.PracticeProgress, target.Id, ct);
            count += await Move(db.InterviewProgress, target.Id, ct);
            count += await Move(db.ReviewSchedules, target.Id, ct);
            count += await Move(db.LearningPreferences, target.Id, ct);
            count += await Move(db.UserTopicVideos, target.Id, ct);
            count += await Move(db.VideoProgress, target.Id, ct);
            count += await Move(db.QuizAttempts, target.Id, ct);
            await db.Users.Where(u => u.Id == UserId).ExecuteDeleteAsync(ct);
            await tx.CommitAsync(ct);
            return count;
        });

        logger.LogWarning("Moved {Count} row(s) of data from before accounts to {Email}. You can now remove LegacyData:AssignToEmail.", moved, email);
        return moved;
    }

    private static Task<int> Move<T>(DbSet<T> set, string targetUserId, CancellationToken ct) where T : class, IUserOwned =>
        set.IgnoreQueryFilters().Where(x => x.UserId == UserId).ExecuteUpdateAsync(s => s.SetProperty(x => x.UserId, targetUserId), ct);

    private static async Task<bool> HasDataAsync(AppDbContext db, string userId, CancellationToken ct) =>
        await db.TopicProgress.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.StudySessions.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.Notes.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.ProjectTaskProgress.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.PortfolioChecks.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.ProjectRepositories.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.PracticeProgress.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.InterviewProgress.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.ReviewSchedules.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.LearningPreferences.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.UserTopicVideos.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.VideoProgress.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct)
        || await db.QuizAttempts.IgnoreQueryFilters().AnyAsync(x => x.UserId == userId, ct);
}
