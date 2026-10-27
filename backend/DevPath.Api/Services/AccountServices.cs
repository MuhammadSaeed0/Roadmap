using DevPath.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace DevPath.Api.Services;

/// <summary>Sends account emails. The app runs locally without a mail server, so the default implementation logs them.</summary>
public interface IAccountEmailSender
{
    Task SendPasswordResetAsync(string email, string resetLink, CancellationToken ct);
}

/// <summary>
/// Writes the password-reset link to the API console instead of emailing it.
/// To send real email, register another IAccountEmailSender (e.g. SMTP) in Program.cs.
/// </summary>
public class LoggingAccountEmailSender(ILogger<LoggingAccountEmailSender> logger) : IAccountEmailSender
{
    public Task SendPasswordResetAsync(string email, string resetLink, CancellationToken ct)
    {
        logger.LogWarning("Password reset requested for {Email}. Open this link to choose a new password: {ResetLink}", email, resetLink);
        return Task.CompletedTask;
    }
}

/// <summary>Identity's built-in rules check length and digits; this adds "at least one letter" (any alphabet, so Arabic counts).</summary>
public class LetterPasswordValidator : IPasswordValidator<AppUser>
{
    public Task<IdentityResult> ValidateAsync(UserManager<AppUser> manager, AppUser user, string? password) =>
        Task.FromResult(password is not null && password.Any(char.IsLetter)
            ? IdentityResult.Success
            : IdentityResult.Failed(new IdentityError { Code = "PasswordRequiresLetter", Description = "Passwords must contain at least one letter." }));
}
