namespace DevPath.Api.Models;

/// <summary>
/// A phase completion certificate. Issued once per learner and phase, the first time they ask for it after
/// finishing every topic of the phase. Anyone with the code can verify it at /c/{code}; a revoked certificate
/// verifies like an unknown code.
/// </summary>
public class Certificate : IUserOwned
{
    public const int CodeLength = 12;

    public int Id { get; set; }
    /// <summary>Random, unguessable and URL-safe (no look-alike characters such as 0/O and 1/I).</summary>
    public required string Code { get; set; }
    public string UserId { get; set; } = "";
    public int PhaseId { get; set; }
    public Phase Phase { get; set; } = null!;
    public DateTime IssuedAt { get; set; }
    /// <summary>
    /// The roadmap the learner followed when it was issued (a phase can belong to several), named on the certificate.
    /// Null for certificates issued before roadmaps existed: they read as the .NET roadmap's phases did.
    /// </summary>
    public string? TrackSlug { get; set; }
    public DateTime? RevokedAt { get; set; }
}
