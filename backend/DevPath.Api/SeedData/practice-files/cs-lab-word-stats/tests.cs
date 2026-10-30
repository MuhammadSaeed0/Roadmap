public static class Tests
{
    [Test("Counts words separated by several spaces")] public static void Count() => Assert.Equal(3, TextStats.CountWords("  hello   big world "));
    [Test("Empty text has no words")] public static void CountEmpty() => Assert.Equal(0, TextStats.CountWords("   "));
    [Test("Finds the longest word")] public static void Longest() => Assert.Equal("ccc", TextStats.LongestWord("a bb ccc dd"));
    [Test("On a tie the first longest word wins")] public static void Tie() => Assert.Equal("abc", TextStats.LongestWord("abc xyz"));
    [Test("Capitalizes every word")] public static void Cap() => Assert.Equal("Learn C# Today", TextStats.Capitalize("learn c# today"));
}
