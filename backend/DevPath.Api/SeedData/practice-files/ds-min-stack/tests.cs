public static class Tests
{
    [Test("Tracks the minimum")]
    public static void T1()
    {
        var s = new MinStack();
        s.Push(5); s.Push(2); s.Push(8);
        Assert.Equal(2, s.Min);
        Assert.Equal(8, s.Top);
    }

    [Test("Minimum comes back after pops")]
    public static void T2()
    {
        var s = new MinStack();
        s.Push(5); s.Push(2); s.Push(8);
        Assert.Equal(8, s.Pop());
        Assert.Equal(2, s.Pop());
        Assert.Equal(5, s.Min);
    }

    [Test("Equal minimums")]
    public static void T3()
    {
        var s = new MinStack();
        s.Push(1); s.Push(1);
        s.Pop();
        Assert.Equal(1, s.Min);
    }

    [Test("Empty stack throws")]
    public static void T4()
    {
        Assert.Throws<InvalidOperationException>(() => new MinStack().Pop());
        Assert.Throws<InvalidOperationException>(() => { var x = new MinStack().Min; });
    }
}
