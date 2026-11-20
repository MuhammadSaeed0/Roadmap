using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>The app reports page changes here; only the route pattern and a daily count are kept.</summary>
[ApiController]
[Route("api/usage")]
public class UsageController(UsageService usage) : ControllerBase
{
    [HttpPost("page-views")]
    public async Task<IActionResult> PageView(PageViewRequest body, CancellationToken ct)
    {
        await usage.RecordAsync(body.Route ?? "", ct);
        return NoContent();
    }
}
