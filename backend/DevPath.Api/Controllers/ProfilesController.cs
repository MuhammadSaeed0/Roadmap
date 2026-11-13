using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
public class ProfilesController(ProfileService profiles) : ControllerBase
{
    /// <summary>The signed-in account's own profile settings.</summary>
    [HttpGet("api/profile")]
    public Task<ProfileSettingsDto> GetSettings(CancellationToken ct) => profiles.GetSettingsAsync(ct);

    [HttpPut("api/profile")]
    public Task<ProfileSettingsDto> UpdateSettings(UpdateProfileSettingsRequest request, CancellationToken ct) =>
        profiles.UpdateSettingsAsync(request, ct);

    /// <summary>Anyone, signed in or not, can read a profile its owner made public. Private or unknown: 404, so the two can't be told apart.</summary>
    [AllowAnonymous]
    [HttpGet("api/profiles/{handle}")]
    public async Task<ActionResult<PublicProfileDto>> GetPublic(string handle, CancellationToken ct) =>
        await profiles.GetPublicAsync(handle, ct) is { } profile ? profile : NotFound();
}
