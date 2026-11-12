public static class Tests
{
    [Test("Nested brackets")]
    public static void T1()
    {
        Assert.True(Algo.IsBalanced("{[()]}"), "Nested brackets");
    }

    [Test("Wrong order")]
    public static void T2()
    {
        Assert.False(Algo.IsBalanced("([)]"), "Wrong order");
    }

    [Test("Unclosed bracket")]
    public static void T3()
    {
        Assert.False(Algo.IsBalanced("(("), "Unclosed bracket");
    }

    [Test("Closing bracket first")]
    public static void T4()
    {
        Assert.False(Algo.IsBalanced(")("), "Closing bracket first");
    }

    [Test("Other characters are ignored")]
    public static void T5()
    {
        Assert.True(Algo.IsBalanced("if (a[0] > 1) { run(); }"), "Other characters are ignored");
    }

    [Test("Empty text is balanced")]
    public static void T6()
    {
        Assert.True(Algo.IsBalanced(""), "Empty text is balanced");
    }
}
