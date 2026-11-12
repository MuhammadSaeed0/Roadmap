public static class Tests
{
    [Test("Up to twenty")]
    public static void T1()
    {
        Assert.SequenceEqual(new[] { 2, 3, 5, 7, 11, 13, 17, 19 }, Numbers.PrimesUpTo(20));
    }

    [Test("The limit is included")]
    public static void T2()
    {
        Assert.SequenceEqual(new[] { 2, 3, 5, 7 }, Numbers.PrimesUpTo(7));
    }

    [Test("Below two there are none")]
    public static void T3()
    {
        Assert.Equal(0, Numbers.PrimesUpTo(1).Count);
    }

    [Test("One million")]
    public static void T4()
    {
        Assert.Equal(78498, Numbers.PrimesUpTo(1000000).Count);
    }
}
