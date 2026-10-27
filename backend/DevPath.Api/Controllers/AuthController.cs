using System.Security.Claims;
using System.Text;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;

namespace DevPath.Api.Controllers;

/// <summary>
/// Email + password accounts on top of ASP.NET Core Identity. Signing in sets an HttpOnly
/// cookie (JavaScript can't read it); every other endpoint requires that cookie.
/// Errors use the same ProblemDetails "code" convention as the rest of the API.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<AppUser> users, SignInManager<AppUser> signIn, IAccountEmailSender email,
    IConfiguration config, TimeProvider clock) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous, EnableRateLimiting(AuthRateLimit.Policy)]
    public async Task<ActionResult<AccountDto>> Register(RegisterRequest request)
    {
        var fullName = request.FullName!.Trim();
        if (fullName.Length == 0) throw new RequestValidationException("fullName", "required", "Enter your name.");
        var address = request.Email!.Trim();

        if (await users.FindByEmailAsync(address) is not null)
            throw new ApiProblemException(409, "email_taken", "An account with this email already exists.");

        var user = new AppUser { UserName = address, Email = address, FullName = fullName, CreatedAt = clock.GetUtcNow().UtcDateTime };
        var result = await users.CreateAsync(user, request.Password!);
        if (!result.Succeeded) throw IdentityProblem(result, "password");

        await signIn.SignInAsync(user, isPersistent: true);
        return CreatedAtAction(nameof(Me), ToDto(user));
    }

    [HttpPost("login")]
    [AllowAnonymous, EnableRateLimiting(AuthRateLimit.Policy)]
    public async Task<ActionResult<AccountDto>> Login(LoginRequest request)
    {
        var user = await users.FindByEmailAsync(request.Email!.Trim());
        // Same answer for "no such account" and "wrong password", so the response doesn't reveal who has an account.
        if (user is null) throw InvalidCredentials();

        var result = await signIn.PasswordSignInAsync(user, request.Password!, isPersistent: true, lockoutOnFailure: true);
        if (result.IsLockedOut)
            throw new ApiProblemException(423, "locked_out", "Too many failed attempts. Try again in a few minutes.");
        if (!result.Succeeded) throw InvalidCredentials();
        return ToDto(user);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout()
    {
        await signIn.SignOutAsync();
        return NoContent();
    }

    /// <summary>The signed-in account. 401 when the cookie is missing, expired or revoked.</summary>
    [HttpGet("me")]
    public async Task<ActionResult<AccountDto>> Me()
    {
        var user = await CurrentUserAsync();
        return ToDto(user);
    }

    /// <summary>
    /// Always answers 202, whether or not the address has an account, so this can't be used
    /// to find out who is registered. The link is valid for one use and expires (Identity's token lifespan).
    /// </summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous, EnableRateLimiting(AuthRateLimit.Policy)]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken ct)
    {
        var user = await users.FindByEmailAsync(request.Email!.Trim());
        if (user is not null)
        {
            var token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(await users.GeneratePasswordResetTokenAsync(user)));
            var frontend = (config["Frontend:BaseUrl"] ?? "http://localhost:4200").TrimEnd('/');
            var link = $"{frontend}/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={token}";
            await email.SendPasswordResetAsync(user.Email!, link, ct);
        }
        return Accepted();
    }

    [HttpPost("reset-password")]
    [AllowAnonymous, EnableRateLimiting(AuthRateLimit.Policy)]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        var user = await users.FindByEmailAsync(request.Email!.Trim()) ?? throw InvalidToken();
        string token;
        try
        {
            token = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token!));
        }
        catch (FormatException)
        {
            throw InvalidToken();
        }

        var result = await users.ResetPasswordAsync(user, token, request.NewPassword!);
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.InvalidToken))) throw InvalidToken();
            throw IdentityProblem(result, "newPassword");
        }
        // A forgotten password may mean the account was compromised: unlock it and end other sessions.
        await users.SetLockoutEndDateAsync(user, null);
        await users.ResetAccessFailedCountAsync(user);
        return NoContent();
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var user = await CurrentUserAsync();
        var result = await users.ChangePasswordAsync(user, request.CurrentPassword!, request.NewPassword!);
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e.Code == nameof(IdentityErrorDescriber.PasswordMismatch)))
                throw new RequestValidationException("currentPassword", "wrong_password", "The current password is incorrect.");
            throw IdentityProblem(result, "newPassword");
        }
        // ChangePasswordAsync rotates the security stamp, which signs out other devices; keep this one signed in.
        await signIn.RefreshSignInAsync(user);
        return NoContent();
    }

    private async Task<AppUser> CurrentUserAsync() =>
        await users.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "")
        ?? throw new ApiProblemException(401, "unauthenticated", "Sign in to continue.");

    private static AccountDto ToDto(AppUser user) => new(user.Id, user.Email!, user.FullName, user.CreatedAt);

    private static ApiProblemException InvalidCredentials() =>
        new(401, "invalid_credentials", "Email or password is incorrect.");

    private static ApiProblemException InvalidToken() =>
        new(400, "invalid_token", "This reset link is invalid or has expired. Request a new one.");

    /// <summary>Maps Identity failures onto the API's error codes.</summary>
    private static Exception IdentityProblem(IdentityResult result, string passwordField)
    {
        var codes = result.Errors.Select(e => e.Code).ToList();
        if (codes.Any(c => c is nameof(IdentityErrorDescriber.DuplicateEmail) or nameof(IdentityErrorDescriber.DuplicateUserName)))
            return new ApiProblemException(409, "email_taken", "An account with this email already exists.");
        if (codes.Any(c => c.StartsWith("Password", StringComparison.Ordinal)))
            return new RequestValidationException(passwordField, "weak_password",
                string.Join(" ", result.Errors.Where(e => e.Code.StartsWith("Password", StringComparison.Ordinal)).Select(e => e.Description)));
        if (codes.Any(c => c.Contains("Email", StringComparison.Ordinal) || c.Contains("UserName", StringComparison.Ordinal)))
            return new RequestValidationException("email", "invalid_email", "Enter a valid email address.");
        return new ApiProblemException(400, "request_failed", string.Join(" ", result.Errors.Select(e => e.Description)));
    }
}

/// <summary>Limits sign-in, sign-up and password-reset attempts per client address.</summary>
public static class AuthRateLimit
{
    public const string Policy = "auth";
}
