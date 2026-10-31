public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "User";
}

public record RegisterRequest(string Email, string Password);
public record LoginRequest(string Email, string Password);
public record TokenResponse(string Token, DateTime ExpiresAt);
