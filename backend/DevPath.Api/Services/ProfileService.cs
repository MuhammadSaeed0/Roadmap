using System.Text.RegularExpressions;
using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Public profiles. The owner opts in and chooses a handle; anyone can then read a summary at /u/{handle}.
///
/// Reading another account's progress bypasses the per-user query filters, so every query here filters on
/// that account's id explicitly and only reads. Nothing is written for the visited account (its XP ledger is
/// shown as it was last reconciled, when the owner opened their Developer Level).
/// </summary>
public partial class ProfileService(AppDbContext db, ICurrentUser currentUser)
{
    [GeneratedRegex("^[a-z0-9](?:[a-z0-9-]{1,28})[a-z0-9]$")]
    private static partial Regex HandlePattern();

    public async Task<ProfileSettingsDto> GetSettingsAsync(CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking().FirstAsync(u => u.Id == currentUser.Id, ct);
        return new ProfileSettingsDto(user.IsProfilePublic, user.PublicHandle);
    }

    public async Task<ProfileSettingsDto> UpdateSettingsAsync(UpdateProfileSettingsRequest request, CancellationToken ct)
    {
        var user = await db.Users.FirstAsync(u => u.Id == currentUser.Id, ct);
        var handle = string.IsNullOrWhiteSpace(request.Handle) ? null : request.Handle.Trim().ToLowerInvariant();

        if (handle is not null)
        {
            if (!HandlePattern().IsMatch(handle) || handle.Contains("--"))
                throw new RequestValidationException("handle", "invalid_handle",
                    "Use 3–30 lowercase letters, digits or single hyphens, starting and ending with a letter or digit.");
            if (await db.Users.AnyAsync(u => u.PublicHandle == handle && u.Id != user.Id, ct))
                throw new BusinessRuleException("handle_taken", "Another account already uses this name.");
        }
        if (request.IsPublic && handle is null)
            throw new RequestValidationException("handle", "required", "Choose a profile name before making the profile public.");

        user.PublicHandle = handle;
        user.IsProfilePublic = request.IsPublic;
        await db.SaveChangesAsync(ct);
        return new ProfileSettingsDto(user.IsProfilePublic, user.PublicHandle);
    }

    /// <summary>Null when no approved account has this handle with a public profile (the caller answers 404 either way).</summary>
    public async Task<PublicProfileDto?> GetPublicAsync(string handle, CancellationToken ct)
    {
        handle = handle.Trim().ToLowerInvariant();
        var user = await db.Users.AsNoTracking()
            .Where(u => u.PublicHandle == handle && u.IsProfilePublic && u.Status == AccountStatus.Approved)
            .Select(u => new { u.Id, u.FullName, u.PublicHandle, u.CreatedAt })
            .FirstOrDefaultAsync(ct);
        if (user is null) return null;
        var id = user.Id;

        var xp = await db.XpTransactions.IgnoreQueryFilters().Where(x => x.UserId == id).SumAsync(x => (int?)x.Points, ct) ?? 0;
        var level = await db.LevelChanges.IgnoreQueryFilters().Where(l => l.UserId == id)
            .OrderByDescending(l => l.ChangedAt).Select(l => l.Level).FirstOrDefaultAsync(ct) ?? "beginner";

        var completedTopics = (await db.TopicProgress.IgnoreQueryFilters()
            .Where(p => p.UserId == id && p.Status == TopicStatus.Completed).Select(p => p.TopicId).ToListAsync(ct)).ToHashSet();

        var acceptedAnswers = await db.Discussions.AsNoTracking()
            .Where(d => d.AcceptedReplyId != null && d.AuthorId != id)
            .Join(db.DiscussionReplies, d => d.AcceptedReplyId, r => (int?)r.Id, (d, r) => r)
            .CountAsync(r => r.AuthorId == id, ct);

        var paths = await BuiltInPathProgressAsync(completedTopics, ct);
        var completedProjects = await ProjectCompletion.CompletedProjectIdsAsync(db, id, ct);
        var repositories = await db.ProjectRepositories.IgnoreQueryFilters().Where(r => r.UserId == id)
            .ToDictionaryAsync(r => r.ProjectId, r => r.RepositoryUrl, ct);
        var reviewed = (await ProjectCompletion.PeerReviewedProjectIdsAsync(db, id, ct)).ToHashSet();

        var projects = await db.Projects.AsNoTracking().Where(p => completedProjects.Contains(p.Id)).OrderBy(p => p.Order)
            .Select(p => new { p.Id, p.TitleEn, p.TitleAr, p.TechStack }).ToListAsync(ct);

        return new PublicProfileDto(
            user.PublicHandle!, user.FullName, user.CreatedAt, level, xp, completedTopics.Count, acceptedAnswers, reviewed.Count,
            paths,
            projects.Select(p => new PublicProjectDto(p.Id, p.TitleEn, p.TitleAr, p.TechStack,
                SafeUrl(repositories.GetValueOrDefault(p.Id)), reviewed.Contains(p.Id))).ToList());
    }

    /// <summary>Built-in paths the learner has started, with their share of completed topics.</summary>
    private async Task<List<PublicPathDto>> BuiltInPathProgressAsync(HashSet<int> completedTopics, CancellationToken ct)
    {
        var paths = await db.LearningPaths.AsNoTracking().Where(p => p.IsBuiltIn).OrderBy(p => p.Id)
            .Select(p => new { p.Id, p.NameEn, p.NameAr, p.IconName }).ToListAsync(ct);
        var topicsByPath = (await (from pp in db.LearningPathPhases
                                   join t in db.Topics on pp.PhaseId equals t.PhaseId
                                   where pp.LearningPath.IsBuiltIn
                                   select new { pp.LearningPathId, TopicId = t.Id }).ToListAsync(ct))
            .GroupBy(x => x.LearningPathId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.TopicId).Distinct().ToList());

        return paths
            .Select(p =>
            {
                var ids = topicsByPath.GetValueOrDefault(p.Id, []);
                var percent = ids.Count == 0 ? 0 : Math.Round(100.0 * ids.Count(completedTopics.Contains) / ids.Count, 1);
                return new PublicPathDto(p.Id, p.NameEn, p.NameAr, p.IconName, percent);
            })
            .Where(p => p.Percent > 0)
            .OrderByDescending(p => p.Percent)
            .ToList();
    }

    /// <summary>Repository links are typed by their owner; only plain web links are shown to visitors.</summary>
    private static string? SafeUrl(string? url) =>
        Uri.TryCreate(url, UriKind.Absolute, out var u) && (u.Scheme == Uri.UriSchemeHttps || u.Scheme == Uri.UriSchemeHttp) ? u.ToString() : null;
}

/// <summary>Project completion for any account, read without the per-user query filter.</summary>
public static class ProjectCompletion
{
    /// <summary>Projects where every required task (change requests excluded) is completed by the account.</summary>
    public static async Task<HashSet<int>> CompletedProjectIdsAsync(AppDbContext db, string userId, CancellationToken ct)
    {
        var required = await db.ProjectTasks.AsNoTracking().Where(t => !t.IsChangeRequest)
            .Select(t => new { t.Id, t.Milestone.ProjectId }).ToListAsync(ct);
        var done = (await db.ProjectTaskProgress.IgnoreQueryFilters()
            .Where(p => p.UserId == userId && p.Status == ProjectTaskStatus.Completed).Select(p => p.ProjectTaskId).ToListAsync(ct)).ToHashSet();
        return required.GroupBy(t => t.ProjectId).Where(g => g.All(t => done.Contains(t.Id))).Select(g => g.Key).ToHashSet();
    }

    /// <summary>Projects of the account that a peer reviewed. Peer reviews arrive in a later change; until then none.</summary>
    public static Task<List<int>> PeerReviewedProjectIdsAsync(AppDbContext db, string userId, CancellationToken ct) =>
        Task.FromResult(new List<int>());
}
