public static class Tests
{
    [Test("Two Money values with the same data are equal")]
    public static void ValueEquality()
    {
        Assert.True(new Money(10m, "EGP") == new Money(10m, "EGP"), "records compare by value");
        Assert.Equal(new Money(10m, "EGP"), new Money(10m, "EGP"));
    }

    [Test("Add returns a new Money and keeps the originals unchanged")]
    public static void Add()
    {
        var a = new Money(10m, "EGP");
        var sum = a.Add(new Money(2.5m, "EGP"));
        Assert.Equal(new Money(12.5m, "EGP"), sum);
        Assert.Equal(10m, a.Amount);
    }

    [Test("Adding different currencies throws")]
    public static void Currencies() =>
        Assert.Throws<InvalidOperationException>(() => new Money(1m, "EGP").Add(new Money(1m, "USD")));

    [Test("A product with the same name and price equals another (nested records)")]
    public static void Nested() =>
        Assert.Equal(new Product("Mouse", new Money(250m, "EGP")), new Product("Mouse", new Money(250m, "EGP")));

    [Test("ToString shows the values")]
    public static void Printing() => Assert.Equal("Money { Amount = 5, Currency = EGP }", new Money(5m, "EGP").ToString());
}
