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
                headers.ContentLength = compressed.Length;
                headers.LastModified = compressed.LastModified.ToString("R");
                // Files under _framework and Monaco's assets carry a content hash in their name.
                headers.CacheControl = path.Contains("/_framework/", StringComparison.Ordinal) || path.Contains("/monaco/vs/assets/", StringComparison.Ordinal)
                    ? "public, max-age=31536000, immutable"
                    : "public, max-age=3600";
                if (HttpMethods.IsHead(request.Method)) return;
                await context.Response.SendFileAsync(compressed, context.RequestAborted);
                return;
            }
        }
        await next(context);
    }
}
