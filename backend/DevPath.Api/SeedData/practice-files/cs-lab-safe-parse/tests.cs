public static class Tests
{
    [Test("Parses a valid age with spaces")] public static void Valid() => Assert.Equal(42, AgeParser.Parse(" 42 "));
    [Test("Text that isn't a number throws InvalidAgeException")]
    public static void NotNumber()
    {
        var e = Assert.Throws<InvalidAgeException>(() => AgeParser.Parse("abc"));
        Assert.Equal("abc", e.Input);
    }
    [Test("Out of range throws")] public static void Range() => Assert.Throws<InvalidAgeException>(() => AgeParser.Parse("200"));
    [Test("InvalidAgeException is an Exception")] public static void Kind() => Assert.True(typeof(Exception).IsAssignableFrom(typeof(InvalidAgeException)), "derive from Exception");
    [Test("TryParse never throws")]
    public static void Try()
    {
        Assert.False(AgeParser.TryParse("x", out _), "x isn't an age");
        Assert.True(AgeParser.TryParse("7", out var age) && age == 7, "7 is an age");
    }
}
