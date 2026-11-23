using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
[Route("api/certificates")]
public class CertificatesController(CertificateService certificates) : ControllerBase
{
    /// <summary>The signed-in learner's finished phases and their certificates.</summary>
    [HttpGet]
    public Task<List<MyCertificateDto>> Mine(CancellationToken ct) => certificates.MineAsync(ct);

    /// <summary>Gets (and on the first call issues) the signed-in learner's certificate for a finished phase.</summary>
    [HttpPost]
    public Task<CertificateDto> Issue(IssueCertificateRequest request, CancellationToken ct) => certificates.IssueAsync(request.PhaseId, ct);

    /// <summary>Public verification: anyone with the code, signed in or not. Unknown or revoked: 404.</summary>
    [AllowAnonymous]
    [HttpGet("{code}")]
    public async Task<ActionResult<PublicCertificateDto>> Verify(string code, CancellationToken ct) =>
        await certificates.VerifyAsync(code, ct) is { } certificate ? certificate : NotFound();
}
