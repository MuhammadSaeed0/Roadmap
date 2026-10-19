public class RequestIdMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var id = Guid.NewGuid().ToString("N");
        context.Response.Headers["X-Request-Id"] = id;   // before the response starts
        await next(context);                              // call the rest of the pipeline
        // code here runs on the way back out
    }
}

app.UseMiddleware<RequestIdMiddleware>();

// Inline middleware
app.Use(async (context, next) =>
{
    var sw = Stopwatch.StartNew();
    await next();
    Console.WriteLine($"{context.Request.Path} took {sw.ElapsedMilliseconds} ms");
});
