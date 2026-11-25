using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>The roadmaps. Visitors see the published ones (landing page); learners also see which one they follow.</summary>
[ApiController]
[Route("api/tracks")]
public class TracksController(TrackService tracks, AccountAccess access) : ControllerBase
{
    [HttpGet, AllowAnonymous]
    public async Task<TracksDto> List(CancellationToken ct)
    {
        // Anonymous endpoints skip the account check; run it so a signed-in admin still sees draft roadmaps.
        await access.GetAsync(ct);
        return await tracks.ListAsync(ct);
    }

    [HttpPut("active")]
    public Task<TracksDto> Choose(ChooseTrackRequest body, CancellationToken ct) => tracks.ChooseAsync(body.Slug!, ct);
}
