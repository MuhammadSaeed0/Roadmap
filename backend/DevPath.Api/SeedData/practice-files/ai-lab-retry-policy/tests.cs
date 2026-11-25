public static class Tests
{
    [Test("Only 429, 408 and 5xx are transient")]
    public static void Transient()
    {
        Assert.True(Retry.IsTransient(429), "429 should be retried");
        Assert.True(Retry.IsTransient(503), "503 should be retried");
        Assert.False(Retry.IsTransient(401), "401 will fail again");
        Assert.False(Retry.IsTransient(400), "400 will fail again");
    }

    [Test("Transient failures are retried with 1s, then 2s")]
    public static async Task Backoff()
    {
        var waits = new List<TimeSpan>();
        var result = await Retry.RunAsync(attempt => attempt < 3 ? throw new ModelException(503) : Task.FromResult("ok"),
            maxAttempts: 4, d => { waits.Add(d); return Task.CompletedTask; });
        Assert.Equal("ok", result);
        Assert.SequenceEqual(new[] { TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(2) }, waits);
    }

    [Test("Retry-After wins over the computed delay")]
    public static async Task RetryAfter()
    {
        var waits = new List<TimeSpan>();
        await Retry.RunAsync(attempt => attempt == 1 ? throw new ModelException(429, TimeSpan.FromSeconds(7)) : Task.FromResult(1),
            3, d => { waits.Add(d); return Task.CompletedTask; });
        Assert.SequenceEqual(new[] { TimeSpan.FromSeconds(7) }, waits);
    }

    [Test("A 401 is not retried")]
    public static async Task NoRetryOn401()
    {
        var calls = 0;
        try { await Retry.RunAsync<int>(_ => { calls++; throw new ModelException(401); }, 3, _ => Task.CompletedTask); }
        catch (ModelException) { Assert.Equal(1, calls); return; }
        Assert.True(false, "the 401 should be rethrown");
    }

    [Test("After the last attempt the error is rethrown")]
    public static async Task GivesUp()
    {
        var calls = 0;
        try { await Retry.RunAsync<int>(_ => { calls++; throw new ModelException(503); }, 3, _ => Task.CompletedTask); }
        catch (ModelException) { Assert.Equal(3, calls); return; }
        Assert.True(false, "the last 503 should be rethrown");
    }
}
