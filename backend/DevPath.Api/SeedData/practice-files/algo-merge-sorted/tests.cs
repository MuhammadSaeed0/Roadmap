public static class Tests
{
    [Test("Interleaved values")]
    public static void T1()
    {
        Assert.SequenceEqual(new[] { 1, 2, 3, 4, 6, 7 }, Algo.Merge([1, 4, 6], [2, 3, 7]));
    }

    [Test("Keeps duplicates")]
    public static void T2()
    {
        Assert.SequenceEqual(new[] { 1, 1, 2, 2 }, Algo.Merge([1, 2], [1, 2]));
    }

    [Test("One empty array")]
    public static void T3()
    {
        Assert.SequenceEqual(new[] { 5, 8 }, Algo.Merge([], [5, 8]));
    }

    [Test("Different lengths")]
    public static void T4()
    {
        Assert.SequenceEqual(new[] { 1, 2, 3, 9 }, Algo.Merge([9], [1, 2, 3]));
    }
}
