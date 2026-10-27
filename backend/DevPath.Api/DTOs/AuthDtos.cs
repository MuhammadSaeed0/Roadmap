using System.ComponentModel.DataAnnotations;

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

public record ResetPasswordRequest(
    [Required, EmailAddress, MaxLength(254)] string? Email,
    [Required, MaxLength(2000)] string? Token,
    [Required, MinLength(8), MaxLength(128)] string? NewPassword);

public record ChangePasswordRequest(
    [Required, MaxLength(128)] string? CurrentPassword,
    [Required, MinLength(8), MaxLength(128)] string? NewPassword);

public record AccountDto(string Id, string Email, string FullName, DateTime CreatedAt);
