public static class Tests
{
    [Test("Three groups")]
    public static void T1()
    {
        var groups = Algo.GroupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
        Assert.Equal(3, groups.Count);
        Assert.SequenceEqual(new[] { "ate", "eat", "tea" }, groups[0]);
        Assert.SequenceEqual(new[] { "bat" }, groups[1]);
        Assert.SequenceEqual(new[] { "nat", "tan" }, groups[2]);
    }

    [Test("Repeated words stay in their group")]
    public static void T2()
    {
        Assert.SequenceEqual(new[] { "ab", "ab", "ba" }, Algo.GroupAnagrams(["ab", "ba", "ab"])[0]);
    }

    [Test("Empty input")]
    public static void T3()
    {
        Assert.Equal(0, Algo.GroupAnagrams([]).Count);
    }
}
