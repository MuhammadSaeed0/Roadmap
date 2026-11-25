using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DevPath.Api.Controllers;

/// <summary>The app reports page changes here; only the route pattern and a daily count are kept.</summary>
[ApiController]
[Route("api/usage")]
public class UsageController(UsageService usage) : ControllerBase
{
    /// <summary>Its own limit per client address, so guest visits never use up sign-in attempts.</summary>
    public const string VisitPolicy = "usage-visits";

    [HttpPost("page-views")]
    public async Task<IActionResult> PageView(PageViewRequest body, CancellationToken ct)
    {
        await usage.RecordAsync(body.Route ?? "", ct);
        return NoContent();
    }

    /// <summary>A guest's visit, once per browser session, with the link's source. No account needed.</summary>
    [HttpPost("visits"), AllowAnonymous, EnableRateLimiting(VisitPolicy)]
    public async Task<IActionResult> Visit(SourceVisitRequest body, CancellationToken ct)
    {
        await usage.RecordSourceAsync(body.Source, signUp: false, ct);
        return NoContent();
    }
}
