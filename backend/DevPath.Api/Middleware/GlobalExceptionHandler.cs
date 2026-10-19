using DevPath.Api.Services;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Middleware;

/// <summary>
/// Converts exceptions into consistent RFC 7807 ProblemDetails responses.
/// Known exceptions get a meaningful status code and a stable "code" the UI can translate.
/// Unknown exceptions return a generic 500 — stack traces are logged, never sent to the client.
/// </summary>
public class GlobalExceptionHandler(IProblemDetailsService problemDetails, ILogger<GlobalExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        ProblemDetails problem;
        switch (exception)
        {
            case NotFoundException nf:
                problem = new ProblemDetails { Status = 404, Title = "Not found", Detail = nf.Message };
                problem.Extensions["code"] = "not_found";
                break;

            case BusinessRuleException br:
                problem = new ProblemDetails { Status = 409, Title = "Request conflicts with a business rule", Detail = br.Message };
                problem.Extensions["code"] = br.Code;
                break;

            case RequestValidationException ve:
                problem = new ValidationProblemDetails(new Dictionary<string, string[]> { [ve.Field] = [ve.Message] })
                {
                    Status = 400, Title = "One or more validation errors occurred."
                };
                problem.Extensions["code"] = ve.Code;
                break;

            case DbUpdateConcurrencyException:
                problem = new ProblemDetails { Status = 409, Title = "The record was changed by someone else. Reload and try again." };
                problem.Extensions["code"] = "concurrency_conflict";
                break;

            case OperationCanceledException when context.RequestAborted.IsCancellationRequested:
                // The browser navigated away; nothing to report.
                logger.LogInformation("Request {Path} was cancelled by the client", context.Request.Path);
                context.Response.StatusCode = 499;
                return true;

            case SqlException or DbUpdateException:
                logger.LogError(exception, "Database error while handling {Method} {Path}", context.Request.Method, context.Request.Path);
                problem = new ProblemDetails { Status = 503, Title = "The database is unavailable or rejected the operation." };
                problem.Extensions["code"] = "database_error";
                break;

            default:
                logger.LogError(exception, "Unhandled exception while handling {Method} {Path}", context.Request.Method, context.Request.Path);
                problem = new ProblemDetails { Status = 500, Title = "An unexpected error occurred." };
                problem.Extensions["code"] = "server_error";
                break;
        }

        context.Response.StatusCode = problem.Status!.Value;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = problem,
            Exception = exception
        });
    }
}
