public static class Tests
{
    [Test("First in, first out")]
    public static void T1()
    {
        var q = new TwoStackQueue<int>();
        q.Enqueue(1); q.Enqueue(2); q.Enqueue(3);
        Assert.Equal(1, q.Dequeue());
        Assert.Equal(2, q.Dequeue());
        Assert.Equal(3, q.Dequeue());
    }

    [Test("Mixing adds and removes keeps the order")]
    public static void T2()
    {
        var q = new TwoStackQueue<string>();
        q.Enqueue("a"); q.Enqueue("b");
        Assert.Equal("a", q.Dequeue());
        q.Enqueue("c");
        Assert.Equal("b", q.Dequeue());
        Assert.Equal("c", q.Dequeue());
    }

    [Test("Count follows the items")]
    public static void T3()
    {
        var q = new TwoStackQueue<int>();
        q.Enqueue(5); q.Enqueue(6);
        q.Dequeue();
        Assert.Equal(1, q.Count);
    }

    [Test("Empty queue throws")]
    public static void T4()
    {
        Assert.Throws<InvalidOperationException>(() => new TwoStackQueue<int>().Dequeue());
    }
}
