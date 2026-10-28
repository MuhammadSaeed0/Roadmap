using DevPath.Api.Data;
using DevPath.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Sign-up steps after the account exists: email verification, then administrator approval.
/// Also sets up the main administrator, who is named in trusted configuration (Admin:OwnerEmail).
/// Ownership only goes to someone who controls both the address and the password: either the account is
/// created from the deployment secret Admin:OwnerPassword, or the address's owner sets a new password through
/// a reset link. Registering (or even verifying) that address is not enough, because whoever registered it
/// chose the password and may still hold a session.
/// </summary>
public class AccountWorkflow(
    AppDbContext db, UserManager<AppUser> users, AccountTokenService tokens, AccountEmails emails,
    IAccountEmailSender sender, IConfiguration config, TimeProvider clock, ILogger<AccountWorkflow> logger)
{
    /// <summary>Minimum time between two verification emails for the same account.</summary>
    public static readonly TimeSpan ResendInterval = TimeSpan.FromSeconds(60);

    public string? OwnerEmail => config["Admin:OwnerEmail"] is { Length: > 0 } e ? e.Trim() : null;

    public bool IsOwnerEmail(string? email) =>
        OwnerEmail is { } owner && string.Equals(owner, email?.Trim(), StringComparison.OrdinalIgnoreCase);

    /// <summary>Sends a fresh verification link. A failed delivery is logged, not thrown: the account stays and the user can resend.</summary>
    public async Task<bool> SendVerificationAsync(AppUser user, CancellationToken ct)
    {
        var token = await tokens.IssueAsync(user.Id, AccountTokenPurpose.EmailVerification, ct);
        return await TrySendAsync(emails.Verification(user.Email!, user.FullName, token), ct);
    }

    /// <summary>
    /// Throttles resends per account (the endpoint is also rate-limited per client address). Accounts from before
    /// verification existed were approved without proving their address, and may still do so.
    /// </summary>
    public async Task ResendVerificationAsync(AppUser user, CancellationToken ct)
    {
        if (user.EmailVerifiedAt is not null || user.Status is AccountStatus.Rejected or AccountStatus.Suspended)
            throw new ApiProblemException(409, "already_verified", "This email address is already confirmed.");
        var last = await tokens.LastIssuedAtAsync(user.Id, AccountTokenPurpose.EmailVerification, ct);
        if (last is { } at && clock.GetUtcNow().UtcDateTime - at < ResendInterval)
            throw new ApiProblemException(429, "resend_too_soon", "A verification email was just sent. Wait a minute before asking for another one.");
        if (!await SendVerificationAsync(user, ct))
            throw new ApiProblemException(503, "email_unavailable", "The email couldn't be sent right now. Try again in a few minutes.");
    }

    /// <summary>Redeems a verification token: confirms the address and moves the account to the approval queue.</summary>
    public async Task<AppUser> VerifyEmailAsync(string? token, CancellationToken ct)
    {
        var userId = await tokens.RedeemAsync(token, AccountTokenPurpose.EmailVerification, ct);
        var user = await users.FindByIdAsync(userId) ?? throw new ApiProblemException(400, "invalid_token", "This verification link is invalid. Request a new one.");
        var now = clock.GetUtcNow().UtcDateTime;
        user.EmailConfirmed = true;
        user.EmailVerifiedAt = now;
        if (user.Status == AccountStatus.PendingEmailVerification)
        {
            user.Status = AccountStatus.PendingApproval;
            user.StatusChangedAt = now;
            user.StatusChangedById = null;
        }
        await users.UpdateAsync(user);
        return user;
    }

    /// <summary>
    /// After a password reset: the reset link proves the address, and the new password was chosen by its owner,
    /// so this is also how the configured main administrator takes over an account registered with that address.
    /// </summary>
    public async Task OnPasswordResetAsync(AppUser user, CancellationToken ct)
    {
        if (user.EmailVerifiedAt is null)
        {
            var now = clock.GetUtcNow().UtcDateTime;
            user.EmailConfirmed = true;
            user.EmailVerifiedAt = now;
            if (user.Status == AccountStatus.PendingEmailVerification)
            {
                user.Status = AccountStatus.PendingApproval;
                user.StatusChangedAt = now;
                user.StatusChangedById = null;
            }
            await users.UpdateAsync(user);
        }
        if (IsOwnerEmail(user.Email) && !user.IsOwner) await ClaimOwnerAsync(user, ct);
    }

    /// <summary>
    /// Start-up: make sure the Admin role exists and the main administrator is set up. Safe to run on every start.
    /// With Admin:OwnerPassword (a deployment secret) and no account for the owner address yet, the owner account is
    /// created ready to use. Otherwise an existing account becomes owner once its address has been verified.
    /// </summary>
    public async Task EnsureOwnerAsync(CancellationToken ct)
    {
        if (!await db.Roles.AnyAsync(r => r.NormalizedName == Roles.Admin.ToUpperInvariant(), ct))
        {
            db.Roles.Add(new IdentityRole(Roles.Admin) { NormalizedName = Roles.Admin.ToUpperInvariant() });
            await db.SaveChangesAsync(ct);
        }

        if (OwnerEmail is not { } email)
        {
            logger.LogWarning("Admin:OwnerEmail is not set, so there is no main administrator.");
            return;
        }

        var current = await db.Users.FirstOrDefaultAsync(u => u.IsOwner, ct);
        if (current is not null && !IsOwnerEmail(current.Email))
        {
            // Ownership isn't moved automatically when the setting changes; that would let a config edit hand it to an unproven address.
            logger.LogWarning("The main administrator is {Current}, not the configured {Configured}. Ownership is not transferred automatically.", current.Email, email);
            await EnsureAdminRoleAsync(current);
            return;
        }

        var user = await users.FindByEmailAsync(email);
        if (user is null)
        {
            var password = config["Admin:OwnerPassword"];
            if (string.IsNullOrEmpty(password))
            {
                logger.LogInformation("The main administrator {Email} has no account yet. Set Admin:OwnerPassword, or register with that address and then use Forgot password to take it over.", email);
                return;
            }
            var now = clock.GetUtcNow().UtcDateTime;
            user = new AppUser
            {
                UserName = email, Email = email, FullName = config["Admin:OwnerName"] is { Length: > 0 } n ? n : "Administrator",
                CreatedAt = now, EmailConfirmed = true, EmailVerifiedAt = now, Status = AccountStatus.Approved, ApprovedAt = now, StatusChangedAt = now,
            };
            var created = await users.CreateAsync(user, password);
            if (!created.Succeeded)
            {
                logger.LogError("Could not create the main administrator account: {Errors}", string.Join(" ", created.Errors.Select(e => e.Description)));
                return;
            }
            logger.LogInformation("Created the main administrator account {Email}.", email);
        }

        if (user.IsOwner)
        {
            await EnsureAdminRoleAsync(user);
            if (user.Status != AccountStatus.Approved) await SetApprovedAsync(user);
            return;
        }
        // An account someone registered with this address: only the deployment secret proves it is the owner's.
        var secret = config["Admin:OwnerPassword"];
        if (string.IsNullOrEmpty(secret) || !await users.CheckPasswordAsync(user, secret))
        {
            logger.LogWarning("An account for the main administrator address {Email} exists but is not the owner yet. Use Forgot password with that address (or set Admin:OwnerPassword to its password) to take it over.", email);
            return;
        }
        if (user.EmailVerifiedAt is null)
        {
            user.EmailConfirmed = true;
            user.EmailVerifiedAt = clock.GetUtcNow().UtcDateTime;
        }
        await ClaimOwnerAsync(user, ct);
    }

    private async Task ClaimOwnerAsync(AppUser user, CancellationToken ct)
    {
        if (await db.Users.AnyAsync(u => u.IsOwner && u.Id != user.Id, ct)) return;
        user.IsOwner = true;
        await SetApprovedAsync(user);
        await EnsureAdminRoleAsync(user);
        db.AdminAudit.Add(new AdminAuditEntry
        {
            CreatedAt = clock.GetUtcNow().UtcDateTime, ActorEmail = "system", Action = "owner_assigned",
            TargetUserId = user.Id, TargetEmail = user.Email ?? "", Details = "Configured main administrator confirmed",
        });
        await db.SaveChangesAsync(ct);
        logger.LogInformation("{Email} is now the main administrator.", user.Email);
    }

    private async Task SetApprovedAsync(AppUser user)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        user.Status = AccountStatus.Approved;
        user.ApprovedAt ??= now;
        user.StatusChangedAt = now;
        await users.UpdateAsync(user);
    }

    private async Task EnsureAdminRoleAsync(AppUser user)
    {
        if (!await users.IsInRoleAsync(user, Roles.Admin)) await users.AddToRoleAsync(user, Roles.Admin);
    }

    /// <summary>Sends an email; returns false (and logs) instead of throwing when delivery fails.</summary>
    public async Task<bool> TrySendAsync(EmailMessage message, CancellationToken ct)
    {
        try
        {
            await sender.SendAsync(message, ct);
            return true;
        }
        catch (Exception e) when (e is EmailDeliveryException or HttpRequestException or TaskCanceledException && !ct.IsCancellationRequested)
        {
            logger.LogError(e, "Could not send the {Kind} email to {To}", message.Kind, message.To);
            return false;
        }
    }
}
