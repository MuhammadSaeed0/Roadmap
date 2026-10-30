public static class Tests
{
    [Test("Raises the event with the old and new price")]
    public static void Raises()
    {
        var s = new Stock("A", 10); PriceChangedEventArgs? seen = null; var calls = 0;
        s.PriceChanged += (_, e) => { seen = e; calls++; };
        s.Price = 12;
        Assert.Equal(1, calls);
        Assert.Equal(new PriceChangedEventArgs(10, 12), seen);
    }
    [Test("No event when the price doesn't change")]
    public static void Same() { var s = new Stock("A", 10); var calls = 0; s.PriceChanged += (_, _) => calls++; s.Price = 10; Assert.Equal(0, calls); }
    [Test("Works with no subscribers")] public static void NoSubscribers() { var s = new Stock("A", 1); s.Price = 2; Assert.Equal(2m, s.Price); }
    [Test("PriceChanged is an event")] public static void IsEvent() => Assert.NotNull(typeof(Stock).GetEvent("PriceChanged"), "declare PriceChanged with the event keyword");
    [Test("Negative prices are rejected")] public static void Negative() => Assert.Throws<ArgumentOutOfRangeException>(() => new Stock("A", 1).Price = -1);
}
