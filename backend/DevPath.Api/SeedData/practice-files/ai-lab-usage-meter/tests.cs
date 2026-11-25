public static class Tests
{
    static readonly Dictionary<string, Price> Prices = new() { ["small"] = new(0.50m, 1.50m), ["large"] = new(5m, 15m) };
    static readonly DateOnly Today = new(2026, 11, 25);

    [Test("The cost uses the model's input and output prices")]
    public static void Cost()
    {
        var meter = new UsageMeter(Prices, 10_000);
        Assert.Equal(0.00345m, meter.Record("sara", "tutor", "small", 6_000, 300, Today));
        Assert.Equal(0.0345m, meter.Record("sara", "tutor", "large", 6_000, 300, Today));
    }

    [Test("A user is blocked once the daily tokens are used")]
    public static void DailyLimit()
    {
        var meter = new UsageMeter(Prices, 1_000);
        meter.Record("omar", "tutor", "small", 700, 200, Today);
        Assert.True(meter.CanCall("omar", Today), "900 of 1,000 tokens used");
        meter.Record("omar", "tutor", "small", 80, 20, Today);
        Assert.False(meter.CanCall("omar", Today), "1,000 of 1,000 tokens used");
        Assert.True(meter.CanCall("omar", Today.AddDays(1)), "a new day starts fresh");
        Assert.True(meter.CanCall("sara", Today), "other users are not affected");
    }

    [Test("Cost is summed per feature")]
    public static void ByFeature()
    {
        var meter = new UsageMeter(Prices, 100_000);
        meter.Record("a", "tutor", "small", 1_000_000, 0, Today);
        meter.Record("b", "tutor", "small", 0, 1_000_000, Today);
        meter.Record("a", "summary", "large", 1_000_000, 0, Today);
        var costs = meter.CostByFeature();
        Assert.Equal(2.00m, costs["tutor"]);
        Assert.Equal(5m, costs["summary"]);
    }

    [Test("An unknown model is an error, not a free call")]
    public static void UnknownModel()
    {
        try { new UsageMeter(Prices, 1_000).Record("a", "tutor", "mystery", 10, 10, Today); }
        catch (KeyNotFoundException) { return; }
        Assert.True(false, "an unknown model should throw KeyNotFoundException");
    }
}
