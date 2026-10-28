using System.ComponentModel.DataAnnotations;
using DevPath.Api.Models;

namespace DevPath.Api.DTOs;

// ---------- Accounts ----------
// Passwords are only ever accepted in request bodies and handed to ASP.NET Core Identity,
// which stores a salted PBKDF2 hash. They are never logged or returned.

public record RegisterRequest(
    [Required, MaxLength(100)] string? FullName,
    [Required, EmailAddress, MaxLength(254)] string? Email,
    [Required, MinLength(8), MaxLength(128)] string? Password);

public record LoginRequest(
    [Required, EmailAddress, MaxLength(254)] string? Email,
    [Required, MaxLength(128)] string? Password);

public record ForgotPasswordRequest([Required, EmailAddress, MaxLength(254)] string? Email);

/// <summary>The token alone identifies the account; Email is accepted for older links and ignored.</summary>
public record ResetPasswordRequest(
    [EmailAddress, MaxLength(254)] string? Email,
    [Required, MaxLength(200)] string? Token,
    [Required, MinLength(8), MaxLength(128)] string? NewPassword);

public record ChangePasswordRequest(
    [Required, MaxLength(128)] string? CurrentPassword,
    [Required, MinLength(8), MaxLength(128)] string? NewPassword);

public record VerifyEmailRequest([Required, MaxLength(200)] string? Token);

public record VerifyEmailResultDto(AccountStatus Status);

/// <summary>IsAdmin is only true for approved administrators; the admin area is still checked on the server.</summary>
public record AccountDto(string Id, string Email, string FullName, DateTime CreatedAt, AccountStatus Status, bool EmailVerified,
    bool IsAdmin, bool IsOwner, string? StatusReason);
