public static class Tests
{
    [Test("Every subscriber receives each new price, in order")]
    public static void Notifies()
    {
        var ticker = new PriceTicker();
        var log = new List<string>();
        ticker.Subscribe(p => log.Add("A" + p));
        ticker.Subscribe(p => log.Add("B" + p));
        ticker.Publish(10m);
        ticker.Publish(12m);
        Assert.SequenceEqual(new[] { "A10", "B10", "A12", "B12" }, log);
        Assert.Equal(12m, ticker.LastPrice);
    }

    [Test("Disposing the subscription stops the notifications")]
    public static void Unsubscribe()
    {
        var ticker = new PriceTicker();
        var seen = new List<decimal>();
        var subscription = ticker.Subscribe(seen.Add);
        ticker.Publish(5m);
        subscription.Dispose();
        ticker.Publish(6m);
        Assert.SequenceEqual(new[] { 5m }, seen);
    }

    [Test("Disposing twice is harmless")]
    public static void DisposeTwice()
    {
        var ticker = new PriceTicker();
        var seen = new List<decimal>();
        var first = ticker.Subscribe(seen.Add);
        ticker.Subscribe(seen.Add);
        first.Dispose();
        first.Dispose();
        ticker.Publish(7m);
        Assert.SequenceEqual(new[] { 7m }, seen);
    }

    [Test("The same price twice in a row is published once")]
    public static void NoDuplicates()
    {
        var ticker = new PriceTicker();
        var count = 0;
        ticker.Subscribe(_ => count++);
        ticker.Publish(9m);
        ticker.Publish(9m);
        Assert.Equal(1, count);
    }
}
