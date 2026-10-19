namespace DevPath.Api.Services;

// Services throw these; Middleware/GlobalExceptionHandler turns them into
// RFC 7807 ProblemDetails responses with the right status code. The "code" is a
// stable machine-readable value the Angular app translates into English/Arabic.

public class NotFoundException(string entity, object id)
    : Exception($"{entity} '{id}' was not found.")
{
    public string Entity { get; } = entity;
}

public class BusinessRuleException(string code, string message) : Exception(message)
{
    public string Code { get; } = code;
}

public class RequestValidationException(string field, string code, string message) : Exception(message)
{
    public string Field { get; } = field;
    public string Code { get; } = code;
}
