public static class Tests
{
    [Test("Keeps first occurrences")]
    public static void T1()
    {
        Assert.SequenceEqual(new[] { 3, 1, 2 }, Lists.Unique([3, 1, 3, 2, 1]));
    }

    [Test("All the same")]
    public static void T2()
    {
        Assert.SequenceEqual(new[] { 5 }, Lists.Unique([5, 5, 5]));
    }

    [Test("Nothing to remove")]
    public static void T3()
    {
        Assert.SequenceEqual(new[] { 1, 2, 3 }, Lists.Unique([1, 2, 3]));
    }

    [Test("Empty input")]
    public static void T4()
    {
        Assert.Equal(0, Lists.Unique([]).Count);
    }
}
