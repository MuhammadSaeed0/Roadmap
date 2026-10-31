public enum OperationOutcome { Success, Created, Deleted, ValidationFailed, Unauthenticated, Forbidden, NotFound, Conflict, Crashed }

public static class HttpStatus
{
    public static int For(OperationOutcome outcome)
    {
        // TODO: a switch expression
        return 200;
    }
}
