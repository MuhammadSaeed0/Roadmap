public static class Tests
{
    [Test("Mixed values")]
    public static void T1()
    {
        Assert.Equal(6, Algo.MaxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4]));
    }

    [Test("All negative returns the largest element")]
    public static void T2()
    {
        Assert.Equal(-1, Algo.MaxSubarraySum([-3, -1, -2]));
    }

    [Test("All positive returns the total")]
    public static void T3()
    {
        Assert.Equal(10, Algo.MaxSubarraySum([1, 2, 3, 4]));
    }

    [Test("One element")]
    public static void T4()
    {
        Assert.Equal(5, Algo.MaxSubarraySum([5]));
    }
}
