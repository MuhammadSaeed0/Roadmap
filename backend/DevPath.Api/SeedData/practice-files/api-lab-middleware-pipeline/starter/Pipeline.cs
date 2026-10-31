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
        // TODO: chain the steps around the endpoint
        return ctx => endpoint(ctx);
    }
}

public static class Middlewares
{
    public static Func<HttpContext, Func<Task>, Task> ErrorHandling => async (ctx, next) => await next();

    public static Func<HttpContext, Func<Task>, Task> ApiKey(string key) => async (ctx, next) => await next();
}
