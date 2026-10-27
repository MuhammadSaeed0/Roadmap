using System.Security.Claims;

namespace DevPath.Api.Services;

/// <summary>Who is making the current request. AppDbContext filters every user table by <see cref="Id"/>.</summary>
public interface ICurrentUser
{
    /// <summary>The signed-in account's id, or null when nobody is signed in.</summary>
    string? Id { get; }
}

/// <summary>Reads the account id from the authentication cookie of the current HTTP request.</summary>
public sealed class HttpCurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public string? Id => accessor.HttpContext?.User.Identity?.IsAuthenticated == true
        ? accessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
        : null;
}
