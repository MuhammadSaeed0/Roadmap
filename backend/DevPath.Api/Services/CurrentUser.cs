using System.Security.Claims;

namespace DevPath.Api.Services;

/// <summary>Who is making the current request. AppDbContext filters every user table by <see cref="Id"/>.</summary>
public interface ICurrentUser
{
    /// <summary>The signed-in account's id, or null when nobody is signed in.</summary>
    string? Id { get; }

    /// <summary>
    /// True for administrators and for work outside a request (start-up, seeding): they see draft roadmaps, which are
    /// hidden from everyone else until they are published.
    /// </summary>
    bool CanSeeDrafts { get; }
}

/// <summary>Reads the account id from the authentication cookie of the current HTTP request.</summary>
public sealed class HttpCurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public string? Id => accessor.HttpContext?.User.Identity?.IsAuthenticated == true
        ? accessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
        : null;

    /// <summary>Outside a request, or for an administrator as checked by <see cref="AccountAccess"/> earlier in this request.</summary>
    public bool CanSeeDrafts => accessor.HttpContext is not { } http || http.Items[AccountAccess.AdminItemKey] is true;
}
