public static class Tests
{
    [Test("Finds a value in the middle")]
    public static void T1()
    {
        Assert.Equal(3, Algo.BinarySearch([1, 3, 5, 7, 9], 7));
    }

    [Test("Finds the first and the last")]
    public static void T2()
    {
        Assert.Equal(0, Algo.BinarySearch([1, 3, 5, 7, 9], 1));
        Assert.Equal(4, Algo.BinarySearch([1, 3, 5, 7, 9], 9));
    }

    [Test("Returns -1 when missing")]
    public static void T3()
    {
        Assert.Equal(-1, Algo.BinarySearch([1, 3, 5, 7, 9], 4));
    }

    [Test("Empty array")]
    public static void T4()
    {
        Assert.Equal(-1, Algo.BinarySearch([], 1));
    }

    [Test("Large array")]
    public static void T5()
    {
        Assert.Equal(99999, Algo.BinarySearch(Enumerable.Range(0, 100000).ToArray(), 99999));
    }
}
