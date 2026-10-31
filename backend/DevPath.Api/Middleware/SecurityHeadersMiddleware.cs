namespace DevPath.Api.Middleware;

/// <summary>
/// Browser hardening headers on every response. The app's content security policy only allows this
/// site's own scripts, plus YouTube for the embedded videos and their thumbnails.
///
/// The code runners under /runners/ get a policy of their own. The app loads them in sandboxed iframes
/// without allow-same-origin, so they run with an opaque origin and can't use the learner's session;
/// that is what makes it safe to give them what running code needs (WebAssembly, blob: workers, and in
/// the preview pages inline scripts and eval for the learner's own HTML and Angular code).
/// </summary>
public class SecurityHeadersMiddleware(RequestDelegate next, IConfiguration config)
{
    public const string RunnersPath = "/runners/";
    public const string PreviewPath = "/runners/preview/";

    private const string AppPolicy =
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://i.ytimg.com; " +
        "font-src 'self' data:; connect-src 'self'; frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com; " +
        "worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

    private readonly string? _publicOrigin =
        Uri.TryCreate(config["Frontend:BaseUrl"], UriKind.Absolute, out var site) ? site.GetLeftPart(UriPartial.Authority) : null;

    public Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;
        headers.XContentTypeOptions = "nosniff";
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";

        var path = context.Request.Path.Value ?? "";
        if (path.StartsWith(RunnersPath, StringComparison.OrdinalIgnoreCase))
        {
            // An opaque origin matches no 'self', so the site is named explicitly: the address the browser
            // used, and the public address when the host terminates TLS in front of the app.
            var origins = string.Join(' ', new[] { $"{context.Request.Scheme}://{context.Request.Host}", _publicOrigin }
                .Where(o => !string.IsNullOrEmpty(o)).Distinct(StringComparer.OrdinalIgnoreCase));
            headers.XFrameOptions = "SAMEORIGIN";
            // Workers inside the sandbox fetch the runtimes with CORS. These are public static files.
            headers.AccessControlAllowOrigin = "*";
            headers.ContentSecurityPolicy = path.StartsWith(PreviewPath, StringComparison.OrdinalIgnoreCase)
                ? $"default-src 'none'; script-src {origins} 'unsafe-inline' 'unsafe-eval' blob: data:; " +
                  $"style-src {origins} 'unsafe-inline' blob: data: https:; img-src * data: blob:; font-src * data:; media-src * data: blob:; " +
                  "connect-src *; base-uri 'none'; form-action 'none'; frame-ancestors 'self'"
                : $"default-src 'none'; script-src {origins} 'wasm-unsafe-eval' blob:; worker-src blob:; connect-src {origins}; " +
                  "base-uri 'none'; form-action 'none'; frame-ancestors 'self'";
        }
        else
        {
            headers.XFrameOptions = "DENY";
            headers.ContentSecurityPolicy = AppPolicy;
        }
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
