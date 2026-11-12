public static class Tests
{
    [Test("Finds the pair at the start")]
    public static void T1()
    {
        Assert.SequenceEqual(new[] { 0, 1 }, Algo.TwoSum([2, 7, 11, 15], 9));
    }

    [Test("Finds a pair in the middle")]
    public static void T2()
    {
        Assert.SequenceEqual(new[] { 1, 2 }, Algo.TwoSum([3, 2, 4], 6));
    }

    [Test("Uses two equal numbers, not one number twice")]
    public static void T3()
    {
        Assert.SequenceEqual(new[] { 0, 1 }, Algo.TwoSum([3, 3], 6));
    }

    [Test("Returns an empty array when there is no pair")]
    public static void T4()
    {
        Assert.Equal(0, Algo.TwoSum([1, 2, 3], 100).Length);
    }

    [Test("Works with negative numbers")]
    public static void T5()
    {
        Assert.SequenceEqual(new[] { 0, 2 }, Algo.TwoSum([-3, 4, 3, 90], 0));
    }
}
