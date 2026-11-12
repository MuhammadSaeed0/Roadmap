public static class Tests
{
    [Test("Two steps")]
    public static void T1()
    {
        Assert.SequenceEqual(new[] { 4, 5, 1, 2, 3 }, Lists.Rotate([1, 2, 3, 4, 5], 2));
    }

    [Test("More steps than items")]
    public static void T2()
    {
        Assert.SequenceEqual(new[] { 3, 1, 2 }, Lists.Rotate([1, 2, 3], 4));
    }

    [Test("Zero steps")]
    public static void T3()
    {
        Assert.SequenceEqual(new[] { 1, 2 }, Lists.Rotate([1, 2], 0));
    }

    [Test("Empty array")]
    public static void T4()
    {
        Assert.Equal(0, Lists.Rotate([], 3).Length);
    }

    [Test("The input is not changed")]
    public static void T5()
    {
        int[] input = [1, 2, 3];
        Lists.Rotate(input, 1);
        Assert.SequenceEqual(new[] { 1, 2, 3 }, input);
    }
}
