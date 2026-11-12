public static class Tests
{
    [Test("Reverses the order")]
    public static void T1()
    {
        Assert.Equal("blue is sky the", Algo.ReverseWords("the sky is blue"));
    }

    [Test("Drops extra spaces")]
    public static void T2()
    {
        Assert.Equal("blue is sky the", Algo.ReverseWords("  the sky   is blue "));
    }

    [Test("One word stays the same")]
    public static void T3()
    {
        Assert.Equal("hello", Algo.ReverseWords(" hello "));
    }

    [Test("Only spaces gives an empty string")]
    public static void T4()
    {
        Assert.Equal("", Algo.ReverseWords("   "));
    }
}
