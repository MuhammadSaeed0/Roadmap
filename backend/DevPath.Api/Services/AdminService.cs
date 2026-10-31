using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DevPath.Api.Services;

/// <summary>
/// User approval and administrator management. The controller already requires an approved admin;
/// the rules here add the hierarchy:
/// * nobody can change their own status or role, and nobody can act on the main administrator;
/// * only the main administrator can grant or revoke admin rights, or change another admin's status.
/// Every change is written to the audit log in the same transaction.
/// </summary>
public class AdminService(
    AppDbContext db, UserManager<AppUser> users, AccountAccess access, AccountWorkflow workflow, AccountEmails emails,
    IOptions<EmailOptions> emailOptions, TimeProvider clock)
{
    private const int MaxPageSize = 100;

    public async Task<AdminOverviewDto> OverviewAsync(CancellationToken ct)
    {
        var actor = await ActorAsync(ct);
        var weekAgo = clock.GetUtcNow().UtcDateTime.AddDays(-7);
        var counts = await RealUsers().GroupBy(u => u.Status).Select(g => new { g.Key, Count = g.Count() }).ToListAsync(ct);
        int Count(AccountStatus s) => counts.FirstOrDefault(c => c.Key == s)?.Count ?? 0;
        var adminIds = AdminIds();
        var stats = new AdminStatsDto(counts.Sum(c => c.Count), Count(AccountStatus.PendingEmailVerification), Count(AccountStatus.PendingApproval),
            Count(AccountStatus.Approved), Count(AccountStatus.Rejected), Count(AccountStatus.Suspended),
            await RealUsers().CountAsync(u => adminIds.Contains(u.Id), ct), await RealUsers().CountAsync(u => u.CreatedAt >= weekAgo, ct));

        var recent = await ToDtos(RealUsers().OrderByDescending(u => u.CreatedAt).Take(8), ct);
        var admins = await ToDtos(RealUsers().Where(u => adminIds.Contains(u.Id)).OrderByDescending(u => u.IsOwner).ThenBy(u => u.Email), ct);
        var actions = await AuditQuery().Take(10).ToListAsync(ct);
        return new AdminOverviewDto(stats, recent, admins, actions, actor.IsOwner, emailOptions.Value.Provider);
    }

    public async Task<AdminUserListDto> ListAsync(string? q, AccountStatus? status, string? role, int page, int pageSize, CancellationToken ct)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);
        var query = RealUsers();
        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(u => u.Email!.Contains(term) || u.FullName.Contains(term));
        }
        if (status is not null) query = query.Where(u => u.Status == status);
        if (role == "admin") query = query.Where(u => AdminIds().Contains(u.Id));
        var total = await query.CountAsync(ct);
        var items = await ToDtos(query.OrderByDescending(u => u.CreatedAt).ThenBy(u => u.Id).Skip((page - 1) * pageSize).Take(pageSize), ct);
        return new AdminUserListDto(items, total, page, pageSize);
    }

    public async Task<AdminUserDto> GetAsync(string id, CancellationToken ct) =>
        (await ToDtos(RealUsers().Where(u => u.Id == id), ct)).SingleOrDefault() ?? throw new NotFoundException("User", id);

    public async Task<IReadOnlyList<AdminAuditDto>> AuditAsync(int take, CancellationToken ct) =>
        await AuditQuery().Take(Math.Clamp(take, 1, 200)).ToListAsync(ct);

    public Task<AdminUserDto> ApproveAsync(string id, CancellationToken ct) =>
        ChangeStatusAsync(id, "approve", [AccountStatus.PendingApproval], AccountStatus.Approved, null,
            u => u.EmailConfirmed ? null : new ApiProblemException(409, "email_not_verified", "This user hasn't confirmed their email address yet."),
            u => emails.Approved(u.Email!, u.FullName), ct);

    public Task<AdminUserDto> RejectAsync(string id, string? reason, CancellationToken ct) =>
        ChangeStatusAsync(id, "reject", [AccountStatus.PendingEmailVerification, AccountStatus.PendingApproval], AccountStatus.Rejected, reason,
            null, u => emails.Rejected(u.Email!, u.FullName, reason), ct);

    public Task<AdminUserDto> SuspendAsync(string id, string? reason, CancellationToken ct) =>
        ChangeStatusAsync(id, "suspend", [AccountStatus.Approved, AccountStatus.PendingApproval], AccountStatus.Suspended, reason,
            null, u => emails.Suspended(u.Email!, u.FullName, reason), ct);

    /// <summary>Back to approved, or to email verification when the address was never confirmed.</summary>
    public async Task<AdminUserDto> ReactivateAsync(string id, CancellationToken ct)
    {
        var target = await FindAsync(id);
        var to = target.EmailConfirmed ? AccountStatus.Approved : AccountStatus.PendingEmailVerification;
        return await ChangeStatusAsync(id, "reactivate", [AccountStatus.Suspended, AccountStatus.Rejected], to, null, null,
            u => u.EmailConfirmed ? emails.Reactivated(u.Email!, u.FullName) : null, ct);
    }

    public async Task<AdminUserDto> ResendVerificationAsync(string id, CancellationToken ct)
    {
        var actor = await ActorAsync(ct);
        var target = await FindAsync(id);
        if (target.Status != AccountStatus.PendingEmailVerification || target.EmailConfirmed)
            throw new ApiProblemException(409, "already_verified", "This user has already confirmed their email address.");
        if (!await workflow.SendVerificationAsync(target, ct))
            throw new ApiProblemException(503, "email_unavailable", "The email couldn't be sent right now. Check the email settings and try again.");
        await AuditAsync(actor, "resend_verification", target, null, ct);
        return await GetAsync(id, ct);
    }

    /// <summary>Grant admin rights to an approved, verified account (main administrator only).</summary>
    public async Task<AdminUserDto> PromoteAsync(string email, CancellationToken ct)
    {
        var actor = await RequireOwnerAsync(ct);
        var target = await users.FindByEmailAsync(email.Trim()) ?? throw new ApiProblemException(404, "user_not_found", "No account uses this email address.");
        Guard(actor, target);
        if (target.Status != AccountStatus.Approved || !target.EmailConfirmed)
            throw new ApiProblemException(409, "not_eligible", "Only approved accounts with a confirmed email can become administrators.");
        if (await users.IsInRoleAsync(target, Roles.Admin))
            throw new ApiProblemException(409, "already_admin", "This account is already an administrator.");

        await InTransactionAsync(async () =>
        {
            var result = await users.AddToRoleAsync(target, Roles.Admin);
            if (!result.Succeeded) throw new ApiProblemException(409, "role_change_failed", "The role couldn't be changed.");
            await AuditAsync(actor, "grant_admin", target, null, ct);
        }, ct);
        await workflow.TrySendAsync(emails.Promoted(target.Email!, target.FullName), ct);
        return await GetAsync(target.Id, ct);
    }

    /// <summary>Remove admin rights (main administrator only; the owner's own rights can't be removed).</summary>
    public async Task<AdminUserDto> RevokeAsync(string id, CancellationToken ct)
    {
        var actor = await RequireOwnerAsync(ct);
        var target = await FindAsync(id);
        Guard(actor, target);
        if (!await users.IsInRoleAsync(target, Roles.Admin))
            throw new ApiProblemException(409, "not_admin", "This account isn't an administrator.");
        await InTransactionAsync(async () =>
        {
            var result = await users.RemoveFromRoleAsync(target, Roles.Admin);
            if (!result.Succeeded) throw new ApiProblemException(409, "role_change_failed", "The role couldn't be changed.");
            await AuditAsync(actor, "revoke_admin", target, null, ct);
        }, ct);
        return await GetAsync(target.Id, ct);
    }

    /// <summary>
    /// Changes an account's display name. Administrators can rename users and themselves; renaming another
    /// administrator (or the main administrator) is for the main administrator.
    /// </summary>
    public async Task<AdminUserDto> RenameAsync(string id, string fullName, CancellationToken ct)
    {
        var actor = await ActorAsync(ct);
        var target = await FindAsync(id);
        var name = fullName.Trim();
        if (name.Length == 0) throw new ApiProblemException(400, "name_required", "Enter a name.");
        if (target.Id != actor.Id && !actor.IsOwner && (target.IsOwner || await users.IsInRoleAsync(target, Roles.Admin)))
            throw new ApiProblemException(403, "owner_required", "Only the main administrator can rename another administrator.");
        if (target.FullName == name) return await GetAsync(id, ct);

        var previous = target.FullName;
        await InTransactionAsync(async () =>
        {
            target.FullName = name;
            var updated = await users.UpdateAsync(target);
            if (!updated.Succeeded) throw new ApiProblemException(409, "update_failed", "The account couldn't be updated. Reload and try again.");
            await AuditAsync(actor, "rename", target, $"{previous} → {name}", ct);
        }, ct);
        return await GetAsync(id, ct);
    }

    /// <summary>
    /// Deletes an account and everything it saved (progress, notes, sessions, projects, practice work…, which the
    /// database removes with it). Nobody can delete themselves or the main administrator, and deleting another
    /// administrator is for the main administrator. The audit log keeps the deletion, with the address it had.
    /// </summary>
    public async Task DeleteAsync(string id, CancellationToken ct)
    {
        var actor = await ActorAsync(ct);
        var target = await FindAsync(id);
        Guard(actor, target);
        if (!actor.IsOwner && await users.IsInRoleAsync(target, Roles.Admin))
            throw new ApiProblemException(403, "owner_required", "Only the main administrator can delete another administrator.");

        await InTransactionAsync(async () =>
        {
            await AuditAsync(actor, "delete_user", target, target.FullName, ct);
            var deleted = await users.DeleteAsync(target);
            if (!deleted.Succeeded) throw new ApiProblemException(409, "delete_failed", "The account couldn't be deleted. Reload and try again.");
        }, ct);
    }

    public async Task SendTestEmailAsync(CancellationToken ct)
    {
        var actor = await RequireOwnerAsync(ct);
        if (!await workflow.TrySendAsync(emails.Test(actor.Email, actor.FullName), ct))
            throw new ApiProblemException(503, "email_unavailable", "The test email couldn't be sent. Check the provider settings and the API log.");
        await AuditAsync(actor, "test_email", null, null, ct);
    }

    private async Task<AdminUserDto> ChangeStatusAsync(string id, string action, AccountStatus[] from, AccountStatus to, string? reason,
        Func<AppUser, ApiProblemException?>? check, Func<AppUser, EmailMessage?> notify, CancellationToken ct)
    {
        var actor = await ActorAsync(ct);
        var target = await FindAsync(id);
        Guard(actor, target);
        // Ordinary administrators manage users; changing another administrator's status is for the main administrator.
        if (!actor.IsOwner && await users.IsInRoleAsync(target, Roles.Admin))
            throw new ApiProblemException(403, "owner_required", "Only the main administrator can change another administrator's account.");
        if (!from.Contains(target.Status))
            throw new ApiProblemException(409, "invalid_status", $"This action isn't possible while the account is {target.Status}.");
        if (check?.Invoke(target) is { } problem) throw problem;

        var now = clock.GetUtcNow().UtcDateTime;
        await InTransactionAsync(async () =>
        {
            target.Status = to;
            target.StatusChangedAt = now;
            target.StatusChangedById = actor.Id;
            target.StatusReason = to is AccountStatus.Rejected or AccountStatus.Suspended ? reason?.Trim() : null;
            if (to == AccountStatus.Approved)
            {
                target.ApprovedAt = now;
                target.ApprovedById = actor.Id;
            }
            var updated = await users.UpdateAsync(target);
            if (!updated.Succeeded) throw new ApiProblemException(409, "update_failed", "The account couldn't be updated. Reload and try again.");
            // Sessions stay valid on purpose: the status is enforced on every request, and a blocked user
            // signed in on the status page sees why instead of being signed out silently.
            await AuditAsync(actor, action, target, reason, ct);
        }, ct);

        if (notify(target) is { } message) await workflow.TrySendAsync(message, ct);
        return await GetAsync(id, ct);
    }

    private static void Guard(AccountSnapshot actor, AppUser target)
    {
        if (target.Id == actor.Id) throw new ApiProblemException(403, "self_action", "You can't change your own account here.");
        if (target.IsOwner) throw new ApiProblemException(403, "owner_protected", "The main administrator's account can't be changed.");
    }

    private async Task<AccountSnapshot> ActorAsync(CancellationToken ct) =>
        await access.GetAsync(ct) is { IsAdmin: true, Status: AccountStatus.Approved } actor
            ? actor
            : throw new ApiProblemException(403, "admin_required", "Only administrators can do that.");

    private async Task<AccountSnapshot> RequireOwnerAsync(CancellationToken ct)
    {
        var actor = await ActorAsync(ct);
        return actor.IsOwner ? actor : throw new ApiProblemException(403, "owner_required", "Only the main administrator can manage administrators.");
    }

    private async Task<AppUser> FindAsync(string id) =>
        await users.FindByIdAsync(id) is { } user && user.Id != LegacyData.UserId ? user : throw new NotFoundException("User", id);

    private async Task AuditAsync(AccountSnapshot actor, string action, AppUser? target, string? details, CancellationToken ct)
    {
        db.AdminAudit.Add(new AdminAuditEntry
        {
            CreatedAt = clock.GetUtcNow().UtcDateTime, ActorId = actor.Id, ActorEmail = actor.Email, Action = action,
            TargetUserId = target?.Id, TargetEmail = target?.Email ?? "", Details = string.IsNullOrWhiteSpace(details) ? null : details.Trim()[..Math.Min(details.Trim().Length, 1000)],
        });
        await db.SaveChangesAsync(ct);
    }

    private async Task InTransactionAsync(Func<Task> work, CancellationToken ct)
    {
        var strategy = db.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            await work();
            await tx.CommitAsync(ct);
        });
    }

    /// <summary>Every account except the placeholder that holds data from before accounts existed.</summary>
    private IQueryable<AppUser> RealUsers() => db.Users.AsNoTracking().Where(u => u.Id != LegacyData.UserId);

    private IQueryable<string> AdminIds() =>
        db.UserRoles.Where(ur => db.Roles.Any(r => r.Id == ur.RoleId && r.Name == Roles.Admin)).Select(ur => ur.UserId);

    private IQueryable<AdminAuditDto> AuditQuery() =>
        db.AdminAudit.AsNoTracking().OrderByDescending(a => a.CreatedAt).ThenByDescending(a => a.Id)
            .Select(a => new AdminAuditDto(a.Id, a.CreatedAt, a.ActorEmail, a.Action, a.TargetEmail, a.Details));

    private async Task<List<AdminUserDto>> ToDtos(IQueryable<AppUser> query, CancellationToken ct)
    {
        var adminIds = AdminIds();
        return await query.Select(u => new AdminUserDto(
            u.Id, u.Email!, u.FullName, u.Status, u.EmailConfirmed, adminIds.Contains(u.Id), u.IsOwner,
            u.CreatedAt, u.EmailVerifiedAt, u.ApprovedAt, db.Users.Where(a => a.Id == u.ApprovedById).Select(a => a.Email).FirstOrDefault(),
            u.StatusChangedAt, db.Users.Where(a => a.Id == u.StatusChangedById).Select(a => a.Email).FirstOrDefault(),
            u.StatusReason, u.LastSignInAt)).ToListAsync(ct);
    }
}
