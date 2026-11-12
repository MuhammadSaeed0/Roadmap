public static class Tests
{
    [Test("Most frequent first")]
    public static void T1()
    {
        Assert.SequenceEqual(new[] { 1, 2 }, Algo.TopKFrequent([1, 1, 1, 2, 2, 3], 2));
    }

    [Test("Ties go to the smaller number")]
    public static void T2()
    {
        Assert.SequenceEqual(new[] { 2, 5 }, Algo.TopKFrequent([5, 2, 5, 2, 9], 2));
    }

    [Test("Fewer distinct numbers than k")]
    public static void T3()
    {
        Assert.SequenceEqual(new[] { 7 }, Algo.TopKFrequent([7, 7], 3));
    }

    [Test("Empty input")]
    public static void T4()
    {
        Assert.Equal(0, Algo.TopKFrequent([], 2).Count);
    }
}
