public static class Tests
{
    [Test("Repeating pattern")]
    public static void T1()
    {
        Assert.Equal(3, Algo.LongestUniqueLength("abcabcbb"));
    }

    [Test("One repeated character")]
    public static void T2()
    {
        Assert.Equal(1, Algo.LongestUniqueLength("bbbbb"));
    }

    [Test("Answer in the middle")]
    public static void T3()
    {
        Assert.Equal(3, Algo.LongestUniqueLength("pwwkew"));
    }

    [Test("Window start must not move backwards")]
    public static void T4()
    {
        Assert.Equal(2, Algo.LongestUniqueLength("abba"));
    }

    [Test("Empty text")]
    public static void T5()
    {
        Assert.Equal(0, Algo.LongestUniqueLength(""));
    }
}
