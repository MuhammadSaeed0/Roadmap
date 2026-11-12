public static class Tests
{
    [Test("Repeated maximum")]
    public static void T1()
    {
        Assert.Equal<int?>(7, Queries.SecondLargest([4, 9, 9, 7]));
    }

    [Test("Negative numbers")]
    public static void T2()
    {
        Assert.Equal<int?>(-5, Queries.SecondLargest([-5, -2, -9]));
    }

    [Test("One distinct value")]
    public static void T3()
    {
        Assert.Equal<int?>(null, Queries.SecondLargest([3, 3, 3]));
    }

    [Test("Empty input")]
    public static void T4()
    {
        Assert.Equal<int?>(null, Queries.SecondLargest([]));
    }
}
