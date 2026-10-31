public static class Tests
{
    [Test("Success codes")]
    public static void Success()
    {
        Assert.Equal(200, HttpStatus.For(OperationOutcome.Success));
        Assert.Equal(201, HttpStatus.For(OperationOutcome.Created));
        Assert.Equal(204, HttpStatus.For(OperationOutcome.Deleted));
    }

    [Test("Client errors")]
    public static void ClientErrors()
    {
        Assert.Equal(400, HttpStatus.For(OperationOutcome.ValidationFailed));
        Assert.Equal(404, HttpStatus.For(OperationOutcome.NotFound));
        Assert.Equal(409, HttpStatus.For(OperationOutcome.Conflict));
    }

    [Test("401 vs 403")]
    public static void AuthErrors()
    {
        Assert.Equal(401, HttpStatus.For(OperationOutcome.Unauthenticated));
        Assert.Equal(403, HttpStatus.For(OperationOutcome.Forbidden));
    }

    [Test("Unknown outcomes are server errors")]
    public static void Unknown() => Assert.Equal(500, HttpStatus.For(OperationOutcome.Crashed));
}
