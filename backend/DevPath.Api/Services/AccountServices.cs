using DevPath.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace DevPath.Api.Services;

/// <summary>Identity's built-in rules check length and digits; this adds "at least one letter" (any alphabet, so Arabic counts).</summary>
public class LetterPasswordValidator : IPasswordValidator<AppUser>
{
    public Task<IdentityResult> ValidateAsync(UserManager<AppUser> manager, AppUser user, string? password) =>
        Task.FromResult(password is not null && password.Any(char.IsLetter)
            ? IdentityResult.Success
            : IdentityResult.Failed(new IdentityError { Code = "PasswordRequiresLetter", Description = "Passwords must contain at least one letter." }));
}
