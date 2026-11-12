public static class Tests
{
    [Test("Unique character in the middle")]
    public static void T1()
    {
        Assert.Equal(1, Algo.FirstUniqueIndex("swiss"));
    }

    [Test("First character is unique")]
    public static void T2()
    {
        Assert.Equal(0, Algo.FirstUniqueIndex("abc"));
    }

    [Test("No unique character")]
    public static void T3()
    {
        Assert.Equal(-1, Algo.FirstUniqueIndex("aabb"));
    }

    [Test("Empty text")]
    public static void T4()
    {
        Assert.Equal(-1, Algo.FirstUniqueIndex(""));
    }

    [Test("Case sensitive")]
    public static void T5()
    {
        Assert.Equal(0, Algo.FirstUniqueIndex("aA"));
    }
}
