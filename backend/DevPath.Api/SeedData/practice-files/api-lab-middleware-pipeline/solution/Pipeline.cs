public class HttpContext
{
    public Dictionary<string, string> Headers { get; } = [];
    public int StatusCode { get; set; } = 200;
    public string Body { get; set; } = "";
    public List<string> Log { get; } = [];
}

public delegate Task RequestDelegate(HttpContext context);

public class Pipeline
{
    private readonly List<Func<HttpContext, Func<Task>, Task>> steps = [];

    public Pipeline Use(Func<HttpContext, Func<Task>, Task> middleware)
    {
        steps.Add(middleware);
        return this;
    }

    public RequestDelegate Build(Func<HttpContext, Task> endpoint)
    {
        RequestDelegate app = ctx => endpoint(ctx);
        for (var i = steps.Count - 1; i >= 0; i--)
        {
            var middleware = steps[i];
            var next = app;
            app = ctx => middleware(ctx, () => next(ctx));
        }
        return app;
    }
}

public static class Middlewares
{
    public static Func<HttpContext, Func<Task>, Task> ErrorHandling => async (ctx, next) =>
    {
        try
        {
            await next();
        }
        catch (Exception)
        {
            ctx.StatusCode = 500;
            ctx.Body = "Something went wrong";
        }
    };

    public static Func<HttpContext, Func<Task>, Task> ApiKey(string key) => async (ctx, next) =>
    {
        if (!ctx.Headers.TryGetValue("X-Api-Key", out var sent) || sent != key)
        {
            ctx.StatusCode = 401;
            return;
        }
        await next();
    };
}
