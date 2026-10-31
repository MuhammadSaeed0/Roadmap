public static class Tests
{
    [Test("Counts each product")]
    public static void Counts()
    {
        var c = Sales.Count(["Mouse", "Keyboard", "Mouse"]);
        Assert.Equal(2, c["Mouse"]);
        Assert.Equal(1, c["Keyboard"]);
    }

    [Test("Ignores letter case")] public static void Case() => Assert.Equal(3, Sales.Count(["mouse", "Mouse", "MOUSE"])["Mouse"]);
    [Test("Keeps the first spelling as the key")] public static void FirstSpelling() => Assert.True(Sales.Count(["Mouse", "mouse"]).Keys.Contains("Mouse") && Sales.Count(["Mouse", "mouse"]).Count == 1, "expected one key");
    [Test("Finds the top product")] public static void Top() => Assert.Equal("Mouse", Sales.TopProduct(["Mouse", "Keyboard", "mouse"]));
    [Test("No products: no top product")] public static void None() => Assert.Equal(null, Sales.TopProduct([]));
}
