public static class Tests
{
    [Test("Boiling point: 100 °C is 212 °F")]
    public static void Boiling() => Assert.Near(212, Temperature.ToFahrenheit(100));

    [Test("Freezing point: 32 °F is 0 °C")]
    public static void Freezing() => Assert.Near(0, Temperature.ToCelsius(32));

    [Test("Rounds to one decimal: 36.6 °C is 97.9 °F")]
    public static void Rounds() => Assert.Near(97.9, Temperature.ToFahrenheit(36.6));

    [Test("Negative values: -40 is the same on both scales")]
    public static void MinusForty()
    {
        Assert.Near(-40, Temperature.ToFahrenheit(-40));
        Assert.Near(-40, Temperature.ToCelsius(-40));
    }
}
