public static class Tests
{
    [Test("First values")]
    public static void T1()
    {
        Assert.Equal(0L, Numbers.Fibonacci(0));
        Assert.Equal(1L, Numbers.Fibonacci(1));
        Assert.Equal(1L, Numbers.Fibonacci(2));
    }

    [Test("Tenth value")]
    public static void T2()
    {
        Assert.Equal(55L, Numbers.Fibonacci(10));
    }

    [Test("Large n answers at once")]
    public static void T3()
    {
        Assert.Equal(2880067194370816120L, Numbers.Fibonacci(90));
    }
}
