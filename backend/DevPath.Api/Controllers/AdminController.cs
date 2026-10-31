using DevPath.Api.DTOs;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>
/// The admin area. Every endpoint requires an approved account with the Admin role, checked
/// against the database on each request; owner-only actions are enforced in <see cref="AdminService"/>.
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize(Policy = Policies.Admin)]
public class AdminController(AdminService admin) : ControllerBase
{
    [HttpGet("overview")]
    public Task<AdminOverviewDto> Overview(CancellationToken ct) => admin.OverviewAsync(ct);

    [HttpGet("users")]
    public Task<AdminUserListDto> ListUsers([FromQuery] string? q, [FromQuery] AccountStatus? status, [FromQuery] string? role,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default) =>
        admin.ListAsync(q, status, role, page, pageSize, ct);

    [HttpGet("users/{id}")]
    public Task<AdminUserDto> GetUser(string id, CancellationToken ct) => admin.GetAsync(id, ct);

    [HttpPost("users/{id}/approve")]
    public Task<AdminUserDto> Approve(string id, CancellationToken ct) => admin.ApproveAsync(id, ct);

    [HttpPost("users/{id}/reject")]
    public Task<AdminUserDto> Reject(string id, AdminStatusRequest request, CancellationToken ct) => admin.RejectAsync(id, request.Reason, ct);

    [HttpPost("users/{id}/suspend")]
    public Task<AdminUserDto> Suspend(string id, AdminStatusRequest request, CancellationToken ct) => admin.SuspendAsync(id, request.Reason, ct);

    [HttpPost("users/{id}/reactivate")]
    public Task<AdminUserDto> Reactivate(string id, CancellationToken ct) => admin.ReactivateAsync(id, ct);

    [HttpPost("users/{id}/resend-verification")]
    public Task<AdminUserDto> ResendVerification(string id, CancellationToken ct) => admin.ResendVerificationAsync(id, ct);

    /// <summary>Changes the account's display name.</summary>
    [HttpPut("users/{id}/name")]
    public Task<AdminUserDto> Rename(string id, AdminRenameRequest request, CancellationToken ct) => admin.RenameAsync(id, request.FullName!, ct);

    /// <summary>Deletes the account and everything it saved, permanently. The audit log keeps a record of the deletion.</summary>
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        await admin.DeleteAsync(id, ct);
        return NoContent();
    }

    /// <summary>Main administrator only: make an existing, approved account an administrator.</summary>
    [HttpPost("admins")]
    public Task<AdminUserDto> Promote(PromoteAdminRequest request, CancellationToken ct) => admin.PromoteAsync(request.Email!, ct);

    /// <summary>Main administrator only.</summary>
    [HttpDelete("admins/{id}")]
    public Task<AdminUserDto> Revoke(string id, CancellationToken ct) => admin.RevokeAsync(id, ct);

    [HttpGet("audit")]
    public Task<IReadOnlyList<AdminAuditDto>> Audit([FromQuery] int take = 50, CancellationToken ct = default) => admin.AuditAsync(take, ct);

    /// <summary>Main administrator only: sends a test email to themselves to check the provider settings.</summary>
    [HttpPost("test-email")]
    public async Task<IActionResult> TestEmail(CancellationToken ct)
    {
        await admin.SendTestEmailAsync(ct);
        return NoContent();
    }
}
