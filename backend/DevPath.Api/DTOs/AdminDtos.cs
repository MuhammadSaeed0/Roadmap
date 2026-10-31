using System.ComponentModel.DataAnnotations;
using DevPath.Api.Models;

namespace DevPath.Api.DTOs;

// ---------- Administration ----------

public record AdminStatsDto(int Total, int PendingVerification, int PendingApproval, int Approved, int Rejected, int Suspended,
    int Admins, int RegisteredLast7Days);

public record AdminUserDto(
    string Id, string Email, string FullName, AccountStatus Status, bool EmailConfirmed, bool IsAdmin, bool IsOwner,
    DateTime CreatedAt, DateTime? EmailVerifiedAt, DateTime? ApprovedAt, string? ApprovedByEmail,
    DateTime? StatusChangedAt, string? StatusChangedByEmail, string? StatusReason, DateTime? LastSignInAt);

public record AdminUserListDto(IReadOnlyList<AdminUserDto> Items, int Total, int Page, int PageSize);

public record AdminAuditDto(long Id, DateTime CreatedAt, string ActorEmail, string Action, string TargetEmail, string? Details);

public record AdminOverviewDto(AdminStatsDto Stats, IReadOnlyList<AdminUserDto> RecentUsers, IReadOnlyList<AdminUserDto> Admins,
    IReadOnlyList<AdminAuditDto> RecentActions, bool CanManageAdmins, string EmailProvider);

/// <summary>Optional note shown to the user (rejection or suspension reason).</summary>
public record AdminStatusRequest([MaxLength(500)] string? Reason);

public record PromoteAdminRequest([Required, EmailAddress, MaxLength(254)] string? Email);

public record AdminRenameRequest([Required, MaxLength(100)] string? FullName);
