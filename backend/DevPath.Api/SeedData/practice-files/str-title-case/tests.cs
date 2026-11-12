public static class Tests
{
    [Test("Mixed case")]
    public static void T1()
    {
        Assert.Equal("The Quick Fox", Text.TitleCase("the qUICK fox"));
    }

    [Test("One word")]
    public static void T2()
    {
        Assert.Equal("Hello", Text.TitleCase("hELLO"));
    }

    [Test("Single letters")]
    public static void T3()
    {
        Assert.Equal("A B C", Text.TitleCase("a b c"));
    }

    [Test("Empty text")]
    public static void T4()
    {
        Assert.Equal("", Text.TitleCase(""));
    }
}
