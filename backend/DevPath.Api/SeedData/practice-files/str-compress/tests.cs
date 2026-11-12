public static class Tests
{
    [Test("Mixed runs")]
    public static void T1()
    {
        Assert.Equal("a3bc2d4", Text.Compress("aaabccdddd"));
    }

    [Test("No repeats stays the same")]
    public static void T2()
    {
        Assert.Equal("abc", Text.Compress("abc"));
    }

    [Test("One long run")]
    public static void T3()
    {
        Assert.Equal("z12", Text.Compress(new string('z', 12)));
    }

    [Test("Empty text")]
    public static void T4()
    {
        Assert.Equal("", Text.Compress(""));
    }

    [Test("Same letter in two runs")]
    public static void T5()
    {
        Assert.Equal("a2ba2", Text.Compress("aabaa"));
    }
}
