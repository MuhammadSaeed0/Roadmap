public enum OperationOutcome { Success, Created, Deleted, ValidationFailed, Unauthenticated, Forbidden, NotFound, Conflict, Crashed }

public static class HttpStatus
{
    public static int For(OperationOutcome outcome) => outcome switch
    {
        OperationOutcome.Success => 200,
        OperationOutcome.Created => 201,
        OperationOutcome.Deleted => 204,
        OperationOutcome.ValidationFailed => 400,
        OperationOutcome.Unauthenticated => 401,
        OperationOutcome.Forbidden => 403,
        OperationOutcome.NotFound => 404,
        OperationOutcome.Conflict => 409,
        _ => 500,
    };
}
