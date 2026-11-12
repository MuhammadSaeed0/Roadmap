public static class Tests
{
    [Test("Shift by three")]
    public static void T1()
    {
        Assert.Equal("Khoor, Zruog!", Text.Caesar("Hello, World!", 3));
    }

    [Test("Wraps past z")]
    public static void T2()
    {
        Assert.Equal("abc", Text.Caesar("xyz", 3));
    }

    [Test("Negative shift undoes it")]
    public static void T3()
    {
        Assert.Equal("Hello", Text.Caesar(Text.Caesar("Hello", 7), -7));
    }

    [Test("Shift larger than the alphabet")]
    public static void T4()
    {
        Assert.Equal("b", Text.Caesar("a", 27));
    }

    [Test("Zero shift")]
    public static void T5()
    {
        Assert.Equal("Same 123", Text.Caesar("Same 123", 0));
    }
}
