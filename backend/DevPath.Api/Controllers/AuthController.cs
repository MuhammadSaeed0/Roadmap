using System.Security.Claims;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DevPath.Api.Controllers;

/// <summary>
/// Email + password accounts on top of ASP.NET Core Identity. Signing in sets an HttpOnly
/// cookie (JavaScript can't read it); every other endpoint requires that cookie.
/// A new account must confirm its email, then be approved by an administrator, before the rest
/// of the API opens up (enforced by the default authorization policy, see AccountAccess).
/// Errors use the same ProblemDetails "code" convention as the rest of the API.
/// </summary>
[ApiController]
[Route("api/auth")]
public class AuthController(
    UserManager<AppUser> users, SignInManager<AppUser> signIn, AccountWorkflow workflow, AccountTokenService tokens,
    AccountEmails emails, TimeProvider clock) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous, EnableRateLimiting(AuthRateLimit.Policy)]
    public async Task<ActionResult<AccountDto>> Register(RegisterRequest request, CancellationToken ct)
    {
        var fullName = request.FullName!.Trim();
        if (fullName.Length == 0) throw new RequestValidationException("fullName", "required", "Enter your name.");
        var address = request.Email!.Trim();

        if (await users.FindByEmailAsync(address) is not null)
            throw new ApiProblemException(409, "email_taken", "An account with this email already exists.");

        var now = clock.GetUtcNow().UtcDateTime;
        var user = new AppUser
        {
            UserName = address, Email = address, FullName = fullName, CreatedAt = now,
            Status = AccountStatus.PendingEmailVerification, StatusChangedAt = now,
        };
        var result = await users.CreateAsync(user, request.Password!);
        if (!result.Succeeded) throw IdentityProblem(result, "password");

        // A failed delivery doesn't undo the sign-up: the status page lets the user resend.
        await workflow.SendVerificationAsync(user, ct);
        // Signed in so the app can show what to do next; everything else stays closed until the account is approved.
        await signIn.SignInAsync(user, isPersistent: true);
        return CreatedAtAction(nameof(Me), await ToDtoAsync(user));
    }

    [HttpPost("login")]
    [AllowAnonymous, EnableRateLimiting(AuthRateLimit.Policy)]
    public async Task<ActionResult<AccountDto>> Login(LoginRequest request)
    {
        var user = await users.FindByEmailAsync(request.Email!.Trim());
        // Same answer for "no such account" and "wrong password", so the response doesn't reveal who has an account.
        if (user is null) throw InvalidCredentials();

        var result = await signIn.CheckPasswordSignInAsync(user, request.Password!, lockoutOnFailure: true);
        if (result.IsLockedOut)
            throw new ApiProblemException(423, "locked_out", "Too many failed attempts. Try again in a few minutes.");
        if (!result.Succeeded) throw InvalidCredentials();

        // Only after the password is proven do we say why a blocked account can't come in.
        if (user.Status == AccountStatus.Rejected)
            throw new ApiProblemException(403, "account_rejected", "Your account request was not approved.");
        if (user.Status == AccountStatus.Suspended)
            throw new ApiProblemException(403, "account_suspended", "Your account is suspended.");

        user.LastSignInAt = clock.GetUtcNow().UtcDateTime;
        await users.UpdateAsync(user);
        await signIn.SignInAsync(user, isPersistent: true);
        return await ToDtoAsync(user);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout()
    {
        await signIn.SignOutAsync();
        return NoContent();
    }

    /// <summary>The signed-in account and its status. 401 when the cookie is missing, expired or revoked.</summary>
    [HttpGet("me")]
    [Authorize(Policy = Policies.SignedIn)]
    public async Task<ActionResult<AccountDto>> Me()
    {
        var user = await CurrentUserAsync();
        return await ToDtoAsync(user);
    }

    /// <summary>
    /// Redeems the token from the verification email. The link opens a page in the app, which posts
    /// the token here, so mail scanners that open links don't use it up. Works without being signed in.
    /// </summary>
    [HttpPost("verify-email")]
    [AllowAnonymous, EnableRateLimiting(AuthRateLimit.Policy)]
    public async Task<ActionResult<VerifyEmailResultDto>> VerifyEmail(VerifyEmailRequest request, CancellationToken ct)
    {
        var user = await workflow.VerifyEmailAsync(request.Token, ct);
        return new VerifyEmailResultDto(user.Status);
    }

    /// <summary>Sends a new verification email to the signed-in account (at most once a minute).</summary>
    [HttpPost("resend-verification")]
    [Authorize(Policy = Policies.SignedIn), EnableRateLimiting(AuthRateLimit.Policy)]
    public async Task<IActionResult> ResendVerification(CancellationToken ct)
    {
        await workflow.ResendVerificationAsync(await CurrentUserAsync(), ct);
        return Accepted();
    }

    /// <summary>
    /// Always answers 202, whether or not the address has an account, so this can't be used
    /// to find out who is registered. The emailed link works once and expires after an hour.
    /// </summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous, EnableRateLimiting(AuthRateLimit.Policy)]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request, CancellationToken ct)
    {
        var user = await users.FindByEmailAsync(request.Email!.Trim());
        // Rejected or suspended accounts get no link: a new password wouldn't let them in anyway. The configured main
        // administrator's address always gets one, since a reset is how its owner takes over an account someone else registered.
        if (user is not null && (user.Status is not (AccountStatus.Rejected or AccountStatus.Suspended) || workflow.IsOwnerEmail(user.Email)))
        {
            var token = await tokens.IssueAsync(user.Id, AccountTokenPurpose.PasswordReset, ct);
            await workflow.TrySendAsync(emails.PasswordReset(user.Email!, user.FullName, token), ct);
        }
        return Accepted();
    }

    [HttpPost("reset-password")]
    [AllowAnonymous, EnableRateLimiting(AuthRateLimit.Policy)]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request, CancellationToken ct)
    {
        // Check the new password before using up the one-time link, so a weak choice doesn't burn it.
        if (await PasswordProblemAsync(request.NewPassword!) is { } problem) throw problem;

        var userId = await tokens.RedeemAsync(request.Token, AccountTokenPurpose.PasswordReset, ct);
        var user = await users.FindByIdAsync(userId) ?? throw InvalidToken();
        // Identity's own reset rotates the security stamp, which signs out every other session.
        var result = await users.ResetPasswordAsync(user, await users.GeneratePasswordResetTokenAsync(user), request.NewPassword!);
        if (!result.Succeeded) throw IdentityProblem(result, "newPassword");
        // The new security stamp ends every existing session immediately (see AccountAccess); also clear any lockout.
        await users.SetLockoutEndDateAsync(user, null);
        await users.ResetAccessFailedCountAsync(user);
        // The link proved the address: confirms it, and lets the configured main administrator take over the account.
        await workflow.OnPasswordResetAsync(user, ct);
        return NoContent();
    }

    [HttpPost("change-password")]
    [Authorize(Policy = Policies.SignedIn)]
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

    private async Task<AccountDto> ToDtoAsync(AppUser user)
    {
        var isAdmin = await users.IsInRoleAsync(user, Roles.Admin);
        return new AccountDto(user.Id, user.Email!, user.FullName, user.CreatedAt, user.Status, user.EmailVerifiedAt is not null,
            isAdmin && user.Status == AccountStatus.Approved, user.IsOwner, user.StatusReason);
    }

    private async Task<Exception?> PasswordProblemAsync(string password)
    {
        foreach (var validator in users.PasswordValidators)
        {
            var result = await validator.ValidateAsync(users, new AppUser(), password);
            if (!result.Succeeded) return IdentityProblem(result, "newPassword");
        }
        return null;
    }

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
