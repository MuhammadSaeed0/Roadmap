using System.Diagnostics;

namespace DevPath.Api.Middleware;

/// <summary>
/// A small custom middleware: logs every API request with its status code and duration
/// using structured logging (the {Placeholders} become searchable properties).
/// Slow requests are logged as warnings so performance problems stand out.
/// </summary>
public class RequestTimingMiddleware(RequestDelegate next, ILogger<RequestTimingMiddleware> logger)
{
    private const int SlowRequestMs = 500;

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            await next(context);
        }
        finally
        {
            sw.Stop();
            var level = sw.ElapsedMilliseconds > SlowRequestMs ? LogLevel.Warning : LogLevel.Information;
            logger.Log(level, "{Method} {Path}{Query} responded {StatusCode} in {ElapsedMs} ms",
                context.Request.Method, context.Request.Path, context.Request.QueryString,
                context.Response.StatusCode, sw.ElapsedMilliseconds);
        }
    }
}
