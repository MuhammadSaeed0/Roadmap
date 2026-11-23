namespace DevPath.Api.DTOs;

public record IssueCertificateRequest(int PhaseId);

/// <summary>The learner's own certificate: the code is the verify link /c/{code}.</summary>
public record CertificateDto(string Code, int PhaseId, DateTime IssuedAt);

/// <summary>What anyone with the code sees. No email, no account id.</summary>
public record PublicCertificateDto(
    string Code, string Name, int PhaseOrder, string PhaseTitleEn, string PhaseTitleAr, int TopicCount, DateTime IssuedAt);
