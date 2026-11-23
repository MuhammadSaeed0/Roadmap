public static class Tests
{
    [Test("MakeMultiplier(3) returns a function that triples")]
    public static void Multiplier()
    {
        var triple = Lambdas.MakeMultiplier(3);
        Assert.Equal(12, triple(4));
        Assert.Equal(-3, triple(-1));
    }

    [Test("Each multiplier remembers its own factor (closure)")]
    public static void Closures()
    {
        var double2 = Lambdas.MakeMultiplier(2);
        var times10 = Lambdas.MakeMultiplier(10);
        Assert.Equal(14, double2(7));
        Assert.Equal(70, times10(7));
    }

    [Test("Where keeps matching items in order")]
    public static void Filter() =>
        Assert.SequenceEqual(new[] { 2, 4, 6 }, Lambdas.Where(new List<int> { 1, 2, 3, 4, 5, 6 }, n => n % 2 == 0));

    [Test("Where works with any type")]
    public static void FilterStrings() =>
        Assert.SequenceEqual(new[] { "Cairo", "Giza" }, Lambdas.Where(new List<string> { "Cairo", "Alexandria", "Giza" }, s => s.Length <= 5));

    [Test("Then runs the first function, then the second")]
    public static void Compose()
    {
        var addOneThenDouble = Lambdas.Then(x => x + 1, x => x * 2);
        Assert.Equal(12, addOneThenDouble(5));
    }
}
