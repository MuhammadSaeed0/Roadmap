public static class Tests
{
    [Test("Several digits")]
    public static void T1()
    {
        Assert.Equal(19, Numbers.DigitSum(4096));
    }

    [Test("One digit")]
    public static void T2()
    {
        Assert.Equal(7, Numbers.DigitSum(7));
    }

    [Test("Zero")]
    public static void T3()
    {
        Assert.Equal(0, Numbers.DigitSum(0));
    }

    [Test("Largest int")]
    public static void T4()
    {
        Assert.Equal(46, Numbers.DigitSum(int.MaxValue));
    }
}
