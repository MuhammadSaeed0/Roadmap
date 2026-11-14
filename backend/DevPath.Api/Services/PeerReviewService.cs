using System.Text.Json;
using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using DevPath.Api.Services.Skills;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Peer review of finished projects. A learner who finished a project and linked its repository asks for a review;
/// any other learner who finished the same project can claim the request and score it against the rubric.
///
/// Review requests are shared between two accounts, so they have no per-user query filter: every query here checks
/// the current account explicitly.
/// </summary>
public class PeerReviewService(AppDbContext db, ICurrentUser currentUser, SkillRules rules, TimeProvider clock)
{
    private string UserId => currentUser.Id ?? throw new ApiProblemException(401, "unauthenticated", "Sign in to continue.");

    public async Task<ReviewRequestListsDto> ListAsync(CancellationToken ct)
    {
        var me = UserId;
        var finished = await ProjectCompletion.CompletedProjectIdsAsync(db, me, ct);
        var open = await Query()
            .Where(r => r.Status == ReviewRequestStatus.Open && r.RequesterId != me && finished.Contains(r.ProjectId))
            .OrderBy(r => r.CreatedAt).ToListAsync(ct);
        var requested = await Query().Where(r => r.RequesterId == me).OrderByDescending(r => r.CreatedAt).ToListAsync(ct);
        var reviewing = await Query()
            .Where(r => r.ReviewerId == me && (r.Status == ReviewRequestStatus.Claimed || r.Status == ReviewRequestStatus.Completed))
            .OrderByDescending(r => r.ClaimedAt).ToListAsync(ct);
        return new ReviewRequestListsDto(Criteria(), open.Select(ToDto).ToList(), requested.Select(ToDto).ToList(), reviewing.Select(ToDto).ToList());
    }

    /// <summary>The current account's latest request for a project, or null.</summary>
    public async Task<ReviewRequestDto?> LatestForProjectAsync(int projectId, CancellationToken ct)
    {
        var me = UserId;
        var r = await Query().Where(x => x.RequesterId == me && x.ProjectId == projectId && x.Status != ReviewRequestStatus.Cancelled)
            .OrderByDescending(x => x.CreatedAt).FirstOrDefaultAsync(ct);
        return r is null ? null : ToDto(r);
    }

    public async Task<ReviewRequestDto> RequestAsync(int projectId, CancellationToken ct)
    {
        var me = UserId;
        if (!await db.Projects.AnyAsync(p => p.Id == projectId, ct)) throw new NotFoundException("Project", projectId);
        if (!(await ProjectCompletion.CompletedProjectIdsAsync(db, me, ct)).Contains(projectId))
            throw new BusinessRuleException("project_not_finished", "Finish every task of the project before asking for a review.");
        var repository = await db.ProjectRepositories.Where(r => r.ProjectId == projectId).Select(r => r.RepositoryUrl).FirstOrDefaultAsync(ct);
        if (string.IsNullOrWhiteSpace(repository))
            throw new BusinessRuleException("repository_required", "Add the project's repository link so a reviewer can read your code.");
        if (await db.ProjectReviewRequests.AnyAsync(r => r.RequesterId == me && r.ProjectId == projectId
                && (r.Status == ReviewRequestStatus.Open || r.Status == ReviewRequestStatus.Claimed), ct))
            throw new BusinessRuleException("review_pending", "This project already has a review request in progress.");

        var request = new ProjectReviewRequest
        {
            ProjectId = projectId, RequesterId = me, RepositoryUrl = repository,
            Status = ReviewRequestStatus.Open, CreatedAt = clock.GetUtcNow().UtcDateTime,
        };
        db.ProjectReviewRequests.Add(request);
        await db.SaveChangesAsync(ct);
        return await GetAsync(request.Id, ct);
    }

    public async Task<ReviewRequestDto> ClaimAsync(int id, CancellationToken ct)
    {
        var me = UserId;
        var request = await db.ProjectReviewRequests.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw new NotFoundException("Review request", id);
        if (request.RequesterId == me)
            throw new BusinessRuleException("own_review", "You can't review your own project.");
        if (!(await ProjectCompletion.CompletedProjectIdsAsync(db, me, ct)).Contains(request.ProjectId))
            throw new BusinessRuleException("project_not_finished", "Finish this project yourself before reviewing someone else's.");

        // Only one reviewer can win: the update succeeds only while the request is still open.
        var now = clock.GetUtcNow().UtcDateTime;
        var claimed = await db.ProjectReviewRequests
            .Where(r => r.Id == id && r.Status == ReviewRequestStatus.Open)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.Status, ReviewRequestStatus.Claimed)
                .SetProperty(r => r.ReviewerId, me).SetProperty(r => r.ClaimedAt, now), ct);
        if (claimed == 0) throw new BusinessRuleException("review_not_open", "Someone else already took this request, or it was cancelled.");

        await NotifyAsync(request.RequesterId, NotificationKind.ReviewClaimed, request.ProjectId, me,
            "{0} started reviewing your project", "بدأ {0} مراجعة مشروعك", ct);
        return await GetAsync(id, ct);
    }

    public async Task<ReviewRequestDto> ReleaseAsync(int id, CancellationToken ct)
    {
        var me = UserId;
        var released = await db.ProjectReviewRequests
            .Where(r => r.Id == id && r.ReviewerId == me && r.Status == ReviewRequestStatus.Claimed)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.Status, ReviewRequestStatus.Open)
                .SetProperty(r => r.ReviewerId, (string?)null).SetProperty(r => r.ClaimedAt, (DateTime?)null), ct);
        if (released == 0) throw new BusinessRuleException("not_reviewer", "Only the reviewer of a claimed request can give it back.");
        // No longer a party to it, the former reviewer still gets its new state (it is back in their open list).
        return ToDto(await Query().FirstAsync(r => r.Id == id, ct));
    }

    public async Task<ReviewRequestDto> SubmitAsync(int id, SubmitReviewRequest body, CancellationToken ct)
    {
        var me = UserId;
        var request = await db.ProjectReviewRequests.FirstOrDefaultAsync(r => r.Id == id, ct) ?? throw new NotFoundException("Review request", id);
        if (request.ReviewerId != me || request.Status != ReviewRequestStatus.Claimed)
            throw new BusinessRuleException("not_reviewer", "Claim the request before submitting a review.");

        var criteria = Criteria();
        var scores = body.Scores ?? [];
        if (criteria.Any(c => !scores.ContainsKey(c)) || scores.Keys.Any(k => !criteria.Contains(k)) || scores.Values.Any(v => v is < 0 or > 4))
            throw new RequestValidationException("scores", "invalid_scores", "Score every criterion from 0 to 4.");
        var notes = body.Notes?.Trim();
        if (notes is { Length: > 4000 }) throw new RequestValidationException("notes", "too_long", "Notes can be at most 4000 characters.");

        request.Scores = JsonSerializer.Serialize(criteria.ToDictionary(c => c, c => scores[c]));
        request.Notes = string.IsNullOrEmpty(notes) ? null : notes;
        request.Status = ReviewRequestStatus.Completed;
        request.CompletedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);

        await NotifyAsync(request.RequesterId, NotificationKind.ReviewCompleted, request.ProjectId, me,
            "{0} finished reviewing your project", "أنهى {0} مراجعة مشروعك", ct);
        return await GetAsync(id, ct);
    }

    public async Task CancelAsync(int id, CancellationToken ct)
    {
        var me = UserId;
        var cancelled = await db.ProjectReviewRequests
            .Where(r => r.Id == id && r.RequesterId == me && (r.Status == ReviewRequestStatus.Open || r.Status == ReviewRequestStatus.Claimed))
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.Status, ReviewRequestStatus.Cancelled), ct);
        if (cancelled == 0) throw new BusinessRuleException("review_not_cancellable", "Only an open or claimed request of yours can be cancelled.");
    }

    // ------------------------------------------------------------------ helpers

    private IReadOnlyList<string> Criteria() => rules.ReviewCriteria.Select(c => c.Key).ToList();

    private IQueryable<ProjectReviewRequest> Query() =>
        db.ProjectReviewRequests.AsNoTracking().Include(r => r.Project).Include(r => r.Requester).Include(r => r.Reviewer);

    /// <summary>Only the two parties and eligible reviewers of an open request may read it.</summary>
    private async Task<ReviewRequestDto> GetAsync(int id, CancellationToken ct)
    {
        var me = UserId;
        var r = await Query().FirstOrDefaultAsync(x => x.Id == id, ct) ?? throw new NotFoundException("Review request", id);
        if (r.RequesterId != me && r.ReviewerId != me) throw new NotFoundException("Review request", id);
        return ToDto(r);
    }

    private ReviewRequestDto ToDto(ProjectReviewRequest r)
    {
        var me = currentUser.Id;
        var scores = r.Scores is null ? null : JsonSerializer.Deserialize<Dictionary<string, int>>(r.Scores);
        return new ReviewRequestDto(
            r.Id, r.ProjectId, r.Project.TitleEn, r.Project.TitleAr, r.Project.TechStack,
            r.Requester.FullName, r.RepositoryUrl, r.Status.ToString(), r.Reviewer?.FullName,
            r.RequesterId == me, r.ReviewerId == me, scores, r.Notes, r.CreatedAt, r.ClaimedAt, r.CompletedAt);
    }

    private async Task NotifyAsync(string recipientId, NotificationKind kind, int projectId, string actorId, string en, string ar, CancellationToken ct)
    {
        var name = await db.Users.Where(u => u.Id == actorId).Select(u => u.FullName).FirstOrDefaultAsync(ct) ?? "";
        db.Notifications.Add(new Notification
        {
            RecipientId = recipientId, Kind = kind, ProjectId = projectId, ActorId = actorId,
            MessageEn = string.Format(en, name), MessageAr = string.Format(ar, name), CreatedAt = clock.GetUtcNow().UtcDateTime,
        });
        await db.SaveChangesAsync(ct);
    }
}
