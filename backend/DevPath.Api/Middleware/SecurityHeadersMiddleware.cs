namespace DevPath.Api.Middleware;

/// <summary>
/// Browser hardening headers on every response. The content security policy only allows this
/// site's own scripts, plus YouTube for the embedded videos and their thumbnails.
/// </summary>
public class SecurityHeadersMiddleware(RequestDelegate next)
{
    private const string ContentSecurityPolicy =
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://i.ytimg.com; " +
        "font-src 'self' data:; connect-src 'self'; frame-src https://www.youtube-nocookie.com https://www.youtube.com; " +
        "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

    public Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;
        headers.XContentTypeOptions = "nosniff";
        headers.XFrameOptions = "DENY";
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
        headers.ContentSecurityPolicy = ContentSecurityPolicy;
        return next(context);
    }
}

/// <summary>
/// Defence in depth against cross-site request forgery, on top of the SameSite=Strict cookie:
/// a state-changing request that carries an Origin header must come from this site: the request's own host,
/// or the public address in Frontend:BaseUrl (the host may end TLS before the app, so the request itself can
/// look like http). In development the Angular dev server in Cors:AllowedOrigins is allowed too.
/// </summary>
public class OriginCheckMiddleware(RequestDelegate next, IConfiguration config, IWebHostEnvironment environment)
{
    private readonly HashSet<string> _allowed = AllowedOrigins(config, environment);

    private static HashSet<string> AllowedOrigins(IConfiguration config, IWebHostEnvironment environment)
    {
        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (Uri.TryCreate(config["Frontend:BaseUrl"], UriKind.Absolute, out var site)) allowed.Add(site.GetLeftPart(UriPartial.Authority));
        if (environment.IsDevelopment()) allowed.UnionWith(config.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? []);
        return allowed;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;
        if (!HttpMethods.IsGet(request.Method) && !HttpMethods.IsHead(request.Method) && !HttpMethods.IsOptions(request.Method)
            && request.Headers.Origin is { Count: > 0 } origin && !IsAllowed(origin.ToString(), request))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(
                new { status = 403, title = "This request came from another site.", code = "bad_origin" },
                (System.Text.Json.JsonSerializerOptions?)null, "application/problem+json");
            return;
        }
        await next(context);
    }

    private bool IsAllowed(string origin, HttpRequest request) =>
        _allowed.Contains(origin) ||
        (Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
         string.Equals(uri.Authority, request.Host.Value, StringComparison.OrdinalIgnoreCase) &&
         string.Equals(uri.Scheme, request.Scheme, StringComparison.OrdinalIgnoreCase));
}
