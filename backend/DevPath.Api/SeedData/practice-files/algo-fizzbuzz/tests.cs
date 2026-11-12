public static class Tests
{
    [Test("First five values")]
    public static void T1()
    {
        Assert.SequenceEqual(new[] { "1", "2", "Fizz", "4", "Buzz" }, Algo.FizzBuzz(5));
    }

    [Test("15 is FizzBuzz")]
    public static void T2()
    {
        Assert.Equal("FizzBuzz", Algo.FizzBuzz(15)[14]);
    }

    [Test("Returns n items")]
    public static void T3()
    {
        Assert.Equal(100, Algo.FizzBuzz(100).Count);
    }

    [Test("Zero gives an empty list")]
    public static void T4()
    {
        Assert.Equal(0, Algo.FizzBuzz(0).Count);
    }
}
