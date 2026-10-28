using Microsoft.AspNetCore.Identity;

namespace DevPath.Api.Models;

/// <summary>
/// An account. ASP.NET Core Identity stores the email, a salted password hash (never the
/// password itself), lockout state and security stamp in the AspNetUsers table.
/// </summary>
public class AppUser : IdentityUser
{
    public string FullName { get; set; } = "";
    public DateTime CreatedAt { get; set; }

    /// <summary>Where the account is in sign-up: verify email → wait for approval → approved (or rejected / suspended).</summary>
    public AccountStatus Status { get; set; } = AccountStatus.PendingEmailVerification;
    /// <summary>
    /// The main administrator. At most one account has this (filtered unique index). It is set only by the
    /// server — from trusted configuration, after the address was proven — never from a request.
    /// </summary>
    public bool IsOwner { get; set; }
    /// <summary>When the address was proven with a verification link. Null for accounts created before verification existed.</summary>
    public DateTime? EmailVerifiedAt { get; set; }
    public DateTime? StatusChangedAt { get; set; }
    /// <summary>The administrator who last changed the status (null when it changed by itself, e.g. after verification).</summary>
    public string? StatusChangedById { get; set; }
    /// <summary>Optional note shown to the user when an administrator rejects or suspends the account.</summary>
    public string? StatusReason { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedById { get; set; }
    public DateTime? LastSignInAt { get; set; }
}

public enum AccountStatus
{
    PendingEmailVerification,
    PendingApproval,
    Approved,
    Rejected,
    Suspended,
}

/// <summary>
/// A one-time link token (email verification, password reset). Only the SHA-256 hash is stored,
/// so a database leak doesn't hand out working links; the token itself exists only in the email.
/// </summary>
public class AccountToken
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    public AccountTokenPurpose Purpose { get; set; }
    /// <summary>Lower-case hex SHA-256 of the token.</summary>
    public required string TokenHash { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    /// <summary>Set when the token is redeemed or replaced by a newer one; a used token never works again.</summary>
    public DateTime? UsedAt { get; set; }
}

public enum AccountTokenPurpose
{
    EmailVerification,
    PasswordReset,
}

/// <summary>Who did what to which account, and when. Never contains passwords or tokens.</summary>
public class AdminAuditEntry
{
    public long Id { get; set; }
    public DateTime CreatedAt { get; set; }
    /// <summary>The administrator, or null for actions taken by the system (start-up owner setup).</summary>
    public string? ActorId { get; set; }
    public string ActorEmail { get; set; } = "";
    public required string Action { get; set; }
    public string? TargetUserId { get; set; }
    public string TargetEmail { get; set; } = "";
    public string? Details { get; set; }
}
