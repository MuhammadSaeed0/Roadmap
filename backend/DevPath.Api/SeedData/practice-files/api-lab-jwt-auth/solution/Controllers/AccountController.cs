using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
public class AccountController : ControllerBase
{
    [HttpGet("api/me")]
    public IActionResult Me() => Ok(new { email = User.FindFirstValue(ClaimTypes.Email), role = User.FindFirstValue(ClaimTypes.Role) });

    [HttpGet("api/admin/stats")]
    [Authorize(Roles = "Admin")]
    public IActionResult Stats() => Ok(new { users = 1 });
}
