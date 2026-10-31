using Microsoft.AspNetCore.Mvc;

[ApiController]
public class AccountController : ControllerBase
{
    [HttpGet("api/me")]
    public IActionResult Me() => Ok();

    [HttpGet("api/admin/stats")]
    public IActionResult Stats() => Ok(new { users = 1 });
}
