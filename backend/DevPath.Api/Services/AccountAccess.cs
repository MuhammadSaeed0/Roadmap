using DevPath.Api.Data;
using DevPath.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DevPath.Api.Services;

/// <summary>Role names stored in AspNetRoles. The main administrator is an Admin with IsOwner set.</summary>
public static class Roles
{
    public const string Admin = "Admin";
}

/// <summary>Authorization policy names.</summary>
public static class Policies
{
    /// <summary>Signed in, whatever the account status: the few endpoints a pending or blocked user still needs (who am I, sign out, verify, resend).</summary>
    public const string SignedIn = "signed-in";
    /// <summary>An approved administrator (checked against the database on every request).</summary>
    public const string Admin = "admin";
}

/// <summary>The signed-in account's status and role, read from the database once per request (never from cookie claims, which go stale).</summary>
public record AccountSnapshot(string Id, string Email, string FullName, AccountStatus Status, bool EmailConfirmed, bool IsOwner, bool IsAdmin);

/// <summary>
/// Loads the current account for authorization. A cookie whose security stamp no longer matches the account
/// (the password was reset or changed elsewhere) counts as signed out straight away, not only at Identity's
/// periodic re-validation, so a reset immediately locks out whoever held an old session.
/// </summary>
public class AccountAccess(AppDbContext db, ICurrentUser currentUser, IHttpContextAccessor http, IOptions<IdentityOptions> identity)
{
    private AccountSnapshot? _snapshot;
    private bool _loaded;

    public async Task<AccountSnapshot?> GetAsync(CancellationToken ct = default)
    {
        if (_loaded) return _snapshot;
        _loaded = true;
        var id = currentUser.Id;
        if (id is null) return null;
        var row = await db.Users.AsNoTracking().Where(u => u.Id == id)
            .Select(u => new
            {
                u.SecurityStamp,
                Account = new AccountSnapshot(u.Id, u.Email!, u.FullName, u.Status, u.EmailConfirmed, u.IsOwner,
                    db.UserRoles.Any(ur => ur.UserId == u.Id && db.Roles.Any(r => r.Id == ur.RoleId && r.Name == Roles.Admin))),
            })
            .SingleOrDefaultAsync(ct);
        var cookieStamp = http.HttpContext?.User.FindFirst(identity.Value.ClaimsIdentity.SecurityStampClaimType)?.Value;
        _snapshot = row is not null && string.Equals(row.SecurityStamp ?? "", cookieStamp ?? "", StringComparison.Ordinal) ? row.Account : null;
        return _snapshot;
    }

    /// <summary>The API error code for an account that may not use the app yet, or null when it is approved.</summary>
    public static (int Status, string Code, string Title)? Block(AccountSnapshot account) => account.Status switch
    {
        AccountStatus.Approved => null,
        AccountStatus.PendingEmailVerification => (403, "account_pending_verification", "Confirm your email address to continue."),
        AccountStatus.PendingApproval => (403, "account_pending_approval", "Your account is waiting for an administrator's approval."),
        AccountStatus.Rejected => (403, "account_rejected", "Your account request was not approved."),
        AccountStatus.Suspended => (403, "account_suspended", "Your account is suspended."),
        _ => (403, "forbidden", "You are not allowed to do that."),
    };
}

/// <summary>Required by every policy: the session belongs to an existing account and hasn't been revoked.</summary>
public class ActiveSessionRequirement : IAuthorizationRequirement;

/// <summary>Required by the default policy: the account must be approved.</summary>
public class ApprovedAccountRequirement : IAuthorizationRequirement;

/// <summary>Required by the admin policy: an approved account with the Admin role.</summary>
public class AdminRequirement : IAuthorizationRequirement;

/// <summary>Carries the API error code to <see cref="ProblemAuthorizationResultHandler"/>.</summary>
public class CodedFailure(IAuthorizationHandler handler, int status, string code, string title) : AuthorizationFailureReason(handler, title)
{
    public int Status { get; } = status;
    public string Code { get; } = code;
}

public class AccountRequirementsHandler(AccountAccess access) : IAuthorizationHandler
{
    public async Task HandleAsync(AuthorizationHandlerContext context)
    {
        var pending = context.PendingRequirements.Where(r => r is ActiveSessionRequirement or ApprovedAccountRequirement or AdminRequirement).ToList();
        if (pending.Count == 0 || context.User.Identity?.IsAuthenticated != true) return;

        var account = await access.GetAsync();
        if (account is null)
        {
            // The cookie points at an account that no longer exists, or its session was revoked.
            context.Fail(new CodedFailure(this, 401, "unauthenticated", "Sign in to continue."));
            return;
        }
        foreach (var requirement in pending.OfType<ActiveSessionRequirement>()) context.Succeed(requirement);
        pending.RemoveAll(r => r is ActiveSessionRequirement);
        if (pending.Count == 0) return;

        if (AccountAccess.Block(account) is { } block)
        {
            context.Fail(new CodedFailure(this, block.Status, block.Code, block.Title));
            return;
        }
        foreach (var requirement in pending)
        {
            if (requirement is AdminRequirement && !account.IsAdmin)
            {
                context.Fail(new CodedFailure(this, 403, "admin_required", "Only administrators can do that."));
                return;
            }
            context.Succeed(requirement);
        }
    }
}

/// <summary>Writes authorization failures as ProblemDetails with the specific code (pending, suspended, admin only…).</summary>
public class ProblemAuthorizationResultHandler : IAuthorizationMiddlewareResultHandler
{
    private readonly AuthorizationMiddlewareResultHandler _default = new();

    public async Task HandleAsync(RequestDelegate next, HttpContext context, AuthorizationPolicy policy, PolicyAuthorizationResult result)
    {
        if (result.Forbidden && result.AuthorizationFailure?.FailureReasons.OfType<CodedFailure>().FirstOrDefault() is { } failure)
        {
            context.Response.StatusCode = failure.Status;
            var problem = new ProblemDetails { Status = failure.Status, Title = failure.Message };
            problem.Extensions["code"] = failure.Code;
            await context.Response.WriteAsJsonAsync(problem, (System.Text.Json.JsonSerializerOptions?)null, "application/problem+json");
            return;
        }
        await _default.HandleAsync(next, context, policy, result);
    }
}
