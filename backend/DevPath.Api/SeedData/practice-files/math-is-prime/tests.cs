public static class Tests
{
    [Test("Small primes")]
    public static void T1()
    {
        Assert.True(Numbers.IsPrime(2), "Small primes");
        Assert.True(Numbers.IsPrime(3), "Small primes");
        Assert.True(Numbers.IsPrime(97), "Small primes");
    }

    [Test("Odd numbers that are not prime")]
    public static void T2()
    {
        Assert.False(Numbers.IsPrime(9), "Odd numbers that are not prime");
        Assert.False(Numbers.IsPrime(91), "Odd numbers that are not prime");
    }

    [Test("Zero, one and negatives are not prime")]
    public static void T3()
    {
        Assert.False(Numbers.IsPrime(0), "Zero, one and negatives are not prime");
        Assert.False(Numbers.IsPrime(1), "Zero, one and negatives are not prime");
        Assert.False(Numbers.IsPrime(-7), "Zero, one and negatives are not prime");
    }

    [Test("A large prime")]
    public static void T4()
    {
        Assert.True(Numbers.IsPrime(2147483647), "A large prime");
    }
}
