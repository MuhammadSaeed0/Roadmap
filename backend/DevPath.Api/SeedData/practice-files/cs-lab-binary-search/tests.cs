public static class Tests
{
    [Test("Finds an item")] public static void Found() => Assert.Equal(3, Search.IndexOf([1, 3, 5, 7, 9], 7));
    [Test("First and last items")] public static void Edges() { Assert.Equal(0, Search.IndexOf([1, 3, 5], 1)); Assert.Equal(2, Search.IndexOf([1, 3, 5], 5)); }
    [Test("Missing item is -1")] public static void Missing() => Assert.Equal(-1, Search.IndexOf([1, 3, 5], 4));
    [Test("Empty array is -1")] public static void Empty() => Assert.Equal(-1, Search.IndexOf([], 4));
    [Test("A million items need at most 21 comparisons")]
    public static void Logarithmic()
    {
        var data = Enumerable.Range(0, 1_000_000).ToArray();
        Assert.Equal(765_432, Search.IndexOf(data, 765_432));
        Assert.True(Search.LastComparisons <= 21, $"used {Search.LastComparisons} comparisons");
    }
}
