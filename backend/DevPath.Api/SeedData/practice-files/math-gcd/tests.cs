public static class Tests
{
    [Test("Common divisor")]
    public static void T1()
    {
        Assert.Equal(6, Numbers.Gcd(48, 18));
    }

    [Test("Order does not matter")]
    public static void T2()
    {
        Assert.Equal(6, Numbers.Gcd(18, 48));
    }

    [Test("Numbers with no common divisor")]
    public static void T3()
    {
        Assert.Equal(1, Numbers.Gcd(17, 5));
    }

    [Test("Zero")]
    public static void T4()
    {
        Assert.Equal(9, Numbers.Gcd(9, 0));
        Assert.Equal(9, Numbers.Gcd(0, 9));
    }
}
