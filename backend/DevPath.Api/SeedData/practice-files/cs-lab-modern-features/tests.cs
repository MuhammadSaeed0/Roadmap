public static class Tests
{
    [Test("Describe uses type and property patterns")]
    public static void Shapes()
    {
        Assert.Equal("circle r=2", Modern.Describe(new Circle(2)));
        Assert.Equal("square 3", Modern.Describe(new Rectangle(3, 3)));
        Assert.Equal("rectangle 2x5", Modern.Describe(new Rectangle(2, 5)));
        Assert.Equal("unknown", Modern.Describe("triangle"));
    }

    [Test("AgeGroup uses relational patterns")]
    public static void Ages()
    {
        Assert.SequenceEqual(new[] { "child", "teen", "teen", "adult", "adult", "senior" },
            new[] { 12, 13, 17, 18, 64, 65 }.Select(Modern.AgeGroup));
        Assert.Throws<ArgumentOutOfRangeException>(() => Modern.AgeGroup(-1));
    }

    [Test("Shipping uses property patterns")]
    public static void Shipping()
    {
        Assert.Equal(0m, Modern.Shipping(new Order(10m, true, "US")));
        Assert.Equal(0m, Modern.Shipping(new Order(1000m, false, "EG")));
        Assert.Equal(50m, Modern.Shipping(new Order(999m, false, "EG")));
        Assert.Equal(50m, Modern.Shipping(new Order(5000m, false, "SA")));
    }

    [Test("Surround builds an array with a collection expression")]
    public static void Collections() => Assert.SequenceEqual(new[] { 0, 1, 2, 9 }, Modern.Surround(0, [1, 2], 9));

    [Test("Greeter takes its name through a primary constructor")]
    public static void PrimaryConstructor()
    {
        var ctor = typeof(Greeter).GetConstructors().Single();
        Assert.Equal(1, ctor.GetParameters().Length);
        Assert.Equal("Hello, Mona!", ((Greeter)ctor.Invoke(["Mona"])).Greet());
    }
}
