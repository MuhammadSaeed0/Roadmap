using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

[ApiController]
[Route("api/auth")]
public class AuthController(UserStore users, IConfiguration config) : ControllerBase
{
    private static readonly PasswordHasher<User> Hasher = new();

    [HttpPost("register")]
    public IActionResult Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || request.Password.Length < 8)
            return ValidationProblem("Enter an email and a password of at least 8 characters.");
        var user = new User { Email = request.Email.Trim() };
        user.PasswordHash = Hasher.HashPassword(user, request.Password);
        return users.TryAdd(user) ? StatusCode(StatusCodes.Status201Created) : Conflict("This email is already registered.");
    }

    [HttpPost("login")]
    public ActionResult<TokenResponse> Login(LoginRequest request)
    {
        var user = users.Find(request.Email.Trim());
        if (user is null || Hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            return Unauthorized("The email or password is incorrect.");

        var jwt = config.GetSection("Jwt");
        var expires = DateTime.UtcNow.AddHours(1);
        var token = new JwtSecurityToken(
            jwt["Issuer"], jwt["Audience"],
            [new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Email, user.Email), new Claim(ClaimTypes.Role, user.Role)],
            expires: expires,
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!)), SecurityAlgorithms.HmacSha256));
        return new TokenResponse(new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
