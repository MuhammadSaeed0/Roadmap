public static class Tests
{
    private sealed class FixedClock(DateTime now) : IClock { public DateTime Now { get; } = now; }
    private sealed class FixedDiscount(int percent) : IDiscountRules { public int PercentFor(DateTime day) => percent; }

    private static readonly DateTime Friday = new(2026, 11, 20);
    private static readonly DateTime Monday = new(2026, 11, 23);

    [Test("No discount on a weekday (the clock comes from the constructor)")]
    public static void Weekday() => Assert.Equal(200m, new PriceService(new FixedClock(Monday), new WeekendDiscount()).FinalPrice(200m));

    [Test("10 % off on a Friday")]
    public static void Weekend() => Assert.Equal(180m, new PriceService(new FixedClock(Friday), new WeekendDiscount()).FinalPrice(200m));

    [Test("The injected discount rules are used, not a hard-coded class")]
    public static void InjectedRules()
    {
        Assert.Equal(150m, new PriceService(new FixedClock(Monday), new FixedDiscount(25)).FinalPrice(200m));
        Assert.Equal(200m, new PriceService(new FixedClock(Friday), new FixedDiscount(0)).FinalPrice(200m));
    }
}
