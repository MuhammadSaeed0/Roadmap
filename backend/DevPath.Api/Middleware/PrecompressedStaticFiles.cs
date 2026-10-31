using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Net.Http.Headers;

namespace DevPath.Api.Middleware;

/// <summary>
/// Serves the Brotli copy of a static file (app.js → app.js.br, made at build time) to browsers that accept
/// it. The editor and the in-browser runtimes are large (the C# runner is about 66 MB raw, 9 MB compressed),
/// and compressing them once at build time costs the shared host no CPU per request.
/// </summary>
public class PrecompressedStaticFiles(RequestDelegate next, IWebHostEnvironment environment, IContentTypeProvider contentTypes)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;
        var path = request.Path.Value;
        if ((HttpMethods.IsGet(request.Method) || HttpMethods.IsHead(request.Method)) &&
            path is { Length: > 1 } && !path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase) &&
            request.Headers.AcceptEncoding.ToString().Contains("br", StringComparison.OrdinalIgnoreCase) &&
            contentTypes.TryGetContentType(path, out var contentType))
        {
            var compressed = environment.WebRootFileProvider.GetFileInfo(path + ".br");
            if (compressed is { Exists: true, IsDirectory: false })
            {
                var headers = context.Response.Headers;
                headers.ContentType = contentType;
                headers.ContentEncoding = "br";
                headers.Vary = HeaderNames.AcceptEncoding;
                var lastModified = compressed.LastModified.ToUniversalTime();
                lastModified = new DateTimeOffset(lastModified.Year, lastModified.Month, lastModified.Day, lastModified.Hour, lastModified.Minute, lastModified.Second, TimeSpan.Zero);
                var etag = $"\"{lastModified.UtcTicks:x}-{compressed.Length:x}\"";
                headers.LastModified = lastModified.ToString("R");
                headers.ETag = etag;
                // Files under _framework and Monaco's assets carry a content hash in their name.
                headers.CacheControl = path.Contains("/_framework/", StringComparison.Ordinal) || path.Contains("/monaco/vs/assets/", StringComparison.Ordinal)
                    ? "public, max-age=31536000, immutable"
                    : "public, max-age=3600";
                // Conditional requests (the code runners revalidate their cached files this way) get a 304 without a body.
                var ifNoneMatch = request.Headers.IfNoneMatch.ToString();
                var notModified = ifNoneMatch.Length > 0
                    ? ifNoneMatch.Split(',').Any(t => t.Trim() == etag || t.Trim() == "*")
                    : DateTimeOffset.TryParse(request.Headers.IfModifiedSince.ToString(), out var since) && lastModified <= since;
                if (notModified)
                {
                    context.Response.StatusCode = StatusCodes.Status304NotModified;
                    headers.ContentLength = null;
                    headers.ContentEncoding = default;
                    return;
                }
                headers.ContentLength = compressed.Length;
                if (HttpMethods.IsHead(request.Method)) return;
                await context.Response.SendFileAsync(compressed, context.RequestAborted);
                return;
            }
        }
        await next(context);
    }
}
