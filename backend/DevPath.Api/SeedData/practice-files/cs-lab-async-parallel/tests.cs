public static class Tests
{
    private static readonly string[] Three = ["keyboard", "mouse", "monitor"];

    [Test("Loads every price")]
    public static async Task Loads()
    {
        var prices = await new PriceLoader(new PriceClient()).LoadAllAsync(Three);
        Assert.Equal(3, prices.Count);
        Assert.Equal(15.99m, prices["mouse"]);
    }

    [Test("Runs the requests in parallel (well under 900 ms)")]
    public static async Task Parallel()
    {
        var watch = System.Diagnostics.Stopwatch.StartNew();
        await new PriceLoader(new PriceClient()).LoadAllAsync(Three);
        Assert.True(watch.ElapsedMilliseconds < 750, $"took {watch.ElapsedMilliseconds} ms");
    }

    [Test("Times out")]
    public static async Task Timeout()
    {
        try { await new PriceLoader(new PriceClient()).LoadWithTimeoutAsync(Three, TimeSpan.FromMilliseconds(100)); }
        catch (TimeoutException) { return; }
        throw new AssertException("expected a TimeoutException");
    }
}
