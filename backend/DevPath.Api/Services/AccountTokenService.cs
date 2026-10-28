using System.Security.Cryptography;
using System.Text;
using DevPath.Api.Data;
using DevPath.Api.Models;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// One-time tokens for email links. The token is 32 random bytes from the OS CSPRNG; only its
/// SHA-256 hash is stored. A token works once, until it expires, and issuing a new one for the
/// same purpose retires the older ones.
/// </summary>
public class AccountTokenService(AppDbContext db, TimeProvider clock)
{
    public static readonly TimeSpan VerificationLifetime = TimeSpan.FromHours(24);
    public static readonly TimeSpan ResetLifetime = TimeSpan.FromHours(1);

    /// <summary>Creates a token and returns the raw value to put in the link (it is not stored anywhere).</summary>
    public async Task<string> IssueAsync(string userId, AccountTokenPurpose purpose, CancellationToken ct)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        await db.AccountTokens.Where(t => t.UserId == userId && t.Purpose == purpose && t.UsedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.UsedAt, now), ct);

        var raw = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
        db.AccountTokens.Add(new AccountToken
        {
            UserId = userId, Purpose = purpose, TokenHash = Hash(raw), CreatedAt = now,
            ExpiresAt = now + (purpose == AccountTokenPurpose.PasswordReset ? ResetLifetime : VerificationLifetime),
        });
        await db.SaveChangesAsync(ct);
        return raw;
    }

    /// <summary>When the last token for this purpose was issued (used to throttle "resend").</summary>
    public Task<DateTime?> LastIssuedAtAsync(string userId, AccountTokenPurpose purpose, CancellationToken ct) =>
        db.AccountTokens.Where(t => t.UserId == userId && t.Purpose == purpose)
            .OrderByDescending(t => t.CreatedAt).Select(t => (DateTime?)t.CreatedAt).FirstOrDefaultAsync(ct);

    /// <summary>
    /// Marks the token used and returns its account id. The update only succeeds while the token is
    /// still unused, so two simultaneous requests can't both redeem it.
    /// </summary>
    public async Task<string> RedeemAsync(string? raw, AccountTokenPurpose purpose, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(raw) || raw.Length > 200) throw Invalid(purpose);
        var hash = Hash(raw.Trim());
        var token = await db.AccountTokens.AsNoTracking().SingleOrDefaultAsync(t => t.TokenHash == hash && t.Purpose == purpose, ct)
            ?? throw Invalid(purpose);
        var now = clock.GetUtcNow().UtcDateTime;
        if (token.UsedAt is not null)
            throw new ApiProblemException(400, "token_used", "This link was already used or replaced by a newer one. Request a new link.");
        if (token.ExpiresAt <= now)
            throw new ApiProblemException(400, "token_expired", "This link has expired. Request a new one.");

        var claimed = await db.AccountTokens.Where(t => t.Id == token.Id && t.UsedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.UsedAt, now), ct);
        if (claimed == 0)
            throw new ApiProblemException(400, "token_used", "This link was already used or replaced by a newer one. Request a new link.");
        return token.UserId;
    }

    private static ApiProblemException Invalid(AccountTokenPurpose purpose) => purpose == AccountTokenPurpose.PasswordReset
        ? new(400, "invalid_token", "This reset link is invalid or has expired. Request a new one.")
        : new(400, "invalid_token", "This verification link is invalid. Request a new one.");

    internal static string Hash(string raw) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(raw)));
}
