// Entity (database shape) — never returned directly
public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public bool IsAdmin { get; set; }
}

// DTOs (API contract)
public record UserDto(int Id, string Email);
public record UpdateProfileRequest(string Email);   // no IsAdmin → no over-posting

// Projection: EF Core selects only Id and Email
var users = await db.Users
    .Select(u => new UserDto(u.Id, u.Email))
    .ToListAsync(ct);
