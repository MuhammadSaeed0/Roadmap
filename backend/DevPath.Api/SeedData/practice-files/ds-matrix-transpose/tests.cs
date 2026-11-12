public static class Tests
{
    [Test("Two by three")]
    public static void T1()
    {
        var t = Lists.Transpose([[1, 2, 3], [4, 5, 6]]);
        Assert.Equal(3, t.Length);
        Assert.SequenceEqual(new[] { 1, 4 }, t[0]);
        Assert.SequenceEqual(new[] { 3, 6 }, t[2]);
    }

    [Test("One row becomes one column")]
    public static void T2()
    {
        var t = Lists.Transpose([[7, 8]]);
        Assert.Equal(2, t.Length);
        Assert.SequenceEqual(new[] { 8 }, t[1]);
    }

    [Test("Transposing twice gives the original")]
    public static void T3()
    {
        var t = Lists.Transpose(Lists.Transpose([[1, 2], [3, 4], [5, 6]]));
        Assert.SequenceEqual(new[] { 3, 4 }, t[1]);
        Assert.Equal(3, t.Length);
    }
}
