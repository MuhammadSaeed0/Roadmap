public static class Tests
{
    [Test("ResetX changes the points stored in the array")]
    public static void Reset()
    {
        Point[] points = [new Point { X = 3, Y = 1 }, new Point { X = -2, Y = 5 }];
        Moves.ResetX(points);
        Assert.SequenceEqual(new[] { 0, 0 }, points.Select(p => p.X));
        Assert.SequenceEqual(new[] { 1, 5 }, points.Select(p => p.Y));
    }

    [Test("CopyOf returns an independent list")]
    public static void Copy()
    {
        var original = new List<int> { 1, 2, 3 };
        var copy = Moves.CopyOf(original);
        copy.Add(4);
        Assert.SequenceEqual(new[] { 1, 2, 3 }, original);
        Assert.SequenceEqual(new[] { 1, 2, 3, 4 }, copy);
    }

    [Test("Swap swaps the caller's variables (pass by ref)")]
    public static void SwapByRef()
    {
        int a = 1, b = 2;
        Moves.Swap(ref a, ref b);
        Assert.Equal(2, a);
        Assert.Equal(1, b);
    }

    [Test("Assigning a class copies the reference, assigning a struct copies the value")]
    public static void Semantics()
    {
        var m1 = new Marker { X = 1 };
        var m2 = m1;
        m2.X = 9;
        var p1 = new Point { X = 1 };
        var p2 = p1;
        p2.X = 9;
        Assert.Equal(9, m1.X);
        Assert.Equal(1, p1.X);
    }
}
