using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Validation;

/// <summary>
/// [ApiController] automatically returns 400 when DataAnnotations validation fails
/// (e.g. [Required], [Range], [MaxLength] on DTOs). This adds a stable "code" to that
/// response so the Angular app can show a translated message.
/// </summary>
public static class ValidationSetup
{
    public static IMvcBuilder AddConsistentValidationResponses(this IMvcBuilder builder) =>
        builder.ConfigureApiBehaviorOptions(options =>
        {
            options.InvalidModelStateResponseFactory = context =>
            {
                var problem = new ValidationProblemDetails(context.ModelState)
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "One or more validation errors occurred.",
                    Instance = context.HttpContext.Request.Path
                };
                problem.Extensions["code"] = "validation_failed";
                problem.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
                return new BadRequestObjectResult(problem) { ContentTypes = { "application/problem+json" } };
            };
        });
}
