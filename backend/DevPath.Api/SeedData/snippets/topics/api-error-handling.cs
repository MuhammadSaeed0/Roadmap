public class NotFoundException(string entity, object id) : Exception($"{entity} '{id}' was not found.");

public class GlobalExceptionHandler(IProblemDetailsService problems, ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception ex, CancellationToken ct)
    {
        var (status, title) = ex switch
        {
            NotFoundException => (404, "Not found"),
            _ => (500, "An unexpected error occurred.")
        };
        if (status == 500) logger.LogError(ex, "Unhandled exception");

        context.Response.StatusCode = status;
        return await problems.TryWriteAsync(new() { HttpContext = context, ProblemDetails = { Status = status, Title = title } });
    }
}

// Program.cs
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
app.UseExceptionHandler();
