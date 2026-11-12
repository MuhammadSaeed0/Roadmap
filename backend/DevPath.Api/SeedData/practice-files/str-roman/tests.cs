public static class Tests
{
    [Test("Small numbers")]
    public static void T1()
    {
        Assert.Equal("III", Text.ToRoman(3));
        Assert.Equal("IV", Text.ToRoman(4));
        Assert.Equal("IX", Text.ToRoman(9));
    }

    [Test("Tens and hundreds")]
    public static void T2()
    {
        Assert.Equal("LVIII", Text.ToRoman(58));
        Assert.Equal("XC", Text.ToRoman(90));
    }

    [Test("A year")]
    public static void T3()
    {
        Assert.Equal("MCMXCIV", Text.ToRoman(1994));
    }

    [Test("The largest number")]
    public static void T4()
    {
        Assert.Equal("MMMCMXCIX", Text.ToRoman(3999));
    }
}
