public static class Tests
{
    [Test("Mixed text")]
    public static void T1()
    {
        Assert.Equal(3, Text.CountVowels("Hello World"));
    }

    [Test("Upper case counts")]
    public static void T2()
    {
        Assert.Equal(5, Text.CountVowels("AEIOU"));
    }

    [Test("No vowels")]
    public static void T3()
    {
        Assert.Equal(0, Text.CountVowels("rhythm"));
    }

    [Test("Empty text")]
    public static void T4()
    {
        Assert.Equal(0, Text.CountVowels(""));
    }
}
