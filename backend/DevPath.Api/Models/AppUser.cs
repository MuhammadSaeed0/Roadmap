using Microsoft.AspNetCore.Identity;

namespace DevPath.Api.Models;

/// <summary>
/// An account. ASP.NET Core Identity stores the email, a salted password hash (never the
/// password itself), lockout state and security stamp in the AspNetUsers table.
/// </summary>
public class AppUser : IdentityUser
{
    public string FullName { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
