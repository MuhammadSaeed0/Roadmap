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

    [Test("Runs the three requests at the same time, not one after another")]
    public static async Task Parallel()
    {
        var client = new PriceClient();
        await new PriceLoader(client).LoadAllAsync(Three);
        Assert.Equal(3, client.MostAtOnce, "requests in flight at the same time");
    }

    [Test("Times out")]
    public static async Task Timeout()
    {
        try { await new PriceLoader(new PriceClient()).LoadWithTimeoutAsync(Three, TimeSpan.FromMilliseconds(100)); }
        catch (TimeoutException) { return; }
        throw new AssertException("expected a TimeoutException");
    }
}
