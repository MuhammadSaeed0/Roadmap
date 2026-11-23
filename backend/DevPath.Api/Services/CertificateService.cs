using System.Security.Cryptography;
using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Phase completion certificates. A learner who finished a phase (<see cref="PhaseCompletion"/>) gets one
/// certificate for it, created on the first request and returned again afterwards. Verification is public and
/// shows only the name, the phase and the date: no email or other account data.
/// </summary>
public class CertificateService(AppDbContext db, ICurrentUser currentUser, TimeProvider clock)
{
    /// <summary>Upper-case letters and digits without the look-alikes 0, O, 1, I and L.</summary>
    private const string Alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

    public static string NewCode() => RandomNumberGenerator.GetString(Alphabet, Certificate.CodeLength);

    /// <summary>The learner's certificate for a phase, issued now if they finished the phase and have none yet.</summary>
    public async Task<CertificateDto> IssueAsync(int phaseId, CancellationToken ct)
    {
        if (!await db.Phases.AnyAsync(p => p.Id == phaseId, ct)) throw new NotFoundException("Phase", phaseId);

        // The query filter limits this to the signed-in learner's certificates.
        var existing = await db.Certificates.AsNoTracking().FirstOrDefaultAsync(c => c.PhaseId == phaseId, ct);
        if (existing is { RevokedAt: null }) return new CertificateDto(existing.Code, existing.PhaseId, existing.IssuedAt);
        if (existing is not null)
            throw new BusinessRuleException("certificate_revoked", "This certificate was revoked.");

        if (!(await PhaseCompletion.FinishedPhaseIdsAsync(db, currentUser.Id!, ct)).Contains(phaseId))
            throw new BusinessRuleException("phase_not_finished", "Complete or skip every topic of this phase first.");

        var certificate = new Certificate { Code = NewCode(), PhaseId = phaseId, IssuedAt = clock.GetUtcNow().UtcDateTime };
        db.Certificates.Add(certificate);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // Two requests at once: the unique (user, phase) index kept only one, so return that one.
            db.ChangeTracker.Clear();
            var saved = await db.Certificates.AsNoTracking().FirstAsync(c => c.PhaseId == phaseId, ct);
            return new CertificateDto(saved.Code, saved.PhaseId, saved.IssuedAt);
        }
        return new CertificateDto(certificate.Code, certificate.PhaseId, certificate.IssuedAt);
    }

    /// <summary>
    /// The learner's certificates page: every finished phase, with its certificate when one was issued (a phase
    /// finished but never asked for has none yet), plus certificates of phases no longer finished (progress
    /// changed after issuing). Revoked certificates are left out. Phases in roadmap order.
    /// </summary>
    public async Task<List<MyCertificateDto>> MineAsync(CancellationToken ct)
    {
        var finished = await PhaseCompletion.FinishedPhaseIdsAsync(db, currentUser.Id!, ct);
        var issued = await db.Certificates.AsNoTracking().Where(c => c.RevokedAt == null)
            .ToDictionaryAsync(c => c.PhaseId, c => new { c.Code, c.IssuedAt }, ct);
        var phaseIds = finished.Union(issued.Keys).ToList();
        var phases = await db.Phases.AsNoTracking().Where(p => phaseIds.Contains(p.Id)).OrderBy(p => p.Order)
            .Select(p => new { p.Id, p.Order, p.TitleEn, p.TitleAr, Topics = p.Topics.Count }).ToListAsync(ct);
        return phases.Select(p =>
        {
            var certificate = issued.GetValueOrDefault(p.Id);
            return new MyCertificateDto(p.Id, p.Order, p.TitleEn, p.TitleAr, p.Topics, certificate?.Code, certificate?.IssuedAt);
        }).ToList();
    }

    /// <summary>Public verification. Unknown, malformed and revoked codes all return null (404), so they can't be told apart.</summary>
    public async Task<PublicCertificateDto?> VerifyAsync(string code, CancellationToken ct)
    {
        code = code.Trim().ToUpperInvariant();
        if (code.Length != Certificate.CodeLength || code.Any(c => !Alphabet.Contains(c))) return null;

        var found = await db.Certificates.IgnoreQueryFilters().AsNoTracking()
            .Where(c => c.Code == code && c.RevokedAt == null)
            .Select(c => new
            {
                c.Code, c.IssuedAt, c.Phase.Order, c.Phase.TitleEn, c.Phase.TitleAr,
                TopicCount = c.Phase.Topics.Count,
                Name = db.Users.Where(u => u.Id == c.UserId).Select(u => u.FullName).FirstOrDefault(),
            })
            .FirstOrDefaultAsync(ct);
        return found is null || found.Name is null
            ? null
            : new PublicCertificateDto(found.Code, found.Name, found.Order, found.TitleEn, found.TitleAr, found.TopicCount, found.IssuedAt);
    }
}
