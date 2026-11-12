public static class Tests
{
    [Test("Counts ignoring case")]
    public static void T1()
    {
        var f = Queries.WordFrequency("The cat and the hat");
        Assert.Equal(2, f["the"]);
        Assert.Equal(1, f["cat"]);
        Assert.Equal(4, f.Count);
    }

    [Test("Extra spaces")]
    public static void T2()
    {
        Assert.Equal(2, Queries.WordFrequency("  a   a  ")["a"]);
    }

    [Test("Empty text")]
    public static void T3()
    {
        Assert.Equal(0, Queries.WordFrequency("").Count);
    }
}
