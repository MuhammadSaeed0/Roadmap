public static class Tests
{
    [Test("Average keeps the decimals")] public static void Decimals() => Assert.Near(1.5, Statistics.Average([1, 2]));
    [Test("Average of one value")] public static void One() => Assert.Near(7, Statistics.Average([7]));
    [Test("Average of nothing is an error")] public static void Empty() => Assert.Throws<InvalidOperationException>(() => Statistics.Average([]));
    [Test("SumTo includes n")] public static void Sum() => Assert.Equal(10, Statistics.SumTo(4));
    [Test("SumTo(1) is 1")] public static void SumOne() => Assert.Equal(1, Statistics.SumTo(1));
}
