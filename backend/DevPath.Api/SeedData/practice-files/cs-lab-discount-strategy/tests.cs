public static class Tests
{
    [Test("10% off 200 is 180")] public static void Percent() => Assert.Equal(180m, Checkout.Total(200, new PercentageDiscount(10)));
    [Test("A fixed discount can't go below zero")] public static void Floor() => Assert.Equal(0m, Checkout.Total(30, new FixedDiscount(50)));
    [Test("No discount keeps the subtotal")] public static void None() => Assert.Equal(99.99m, Checkout.Total(99.99m, new NoDiscount()));
    [Test("Rounds to two decimals")] public static void Round() => Assert.Equal(66.67m, Checkout.Total(100, new PercentageDiscount(33.33m)));
    [Test("Rejects a percentage above 100")] public static void Invalid() => Assert.Throws<ArgumentOutOfRangeException>(() => new PercentageDiscount(120));
    [Test("Every rule implements IDiscount")] public static void Interface() => Assert.True(typeof(IDiscount).IsAssignableFrom(typeof(FixedDiscount)) && typeof(IDiscount).IsAssignableFrom(typeof(NoDiscount)), "all rules implement IDiscount");
}
