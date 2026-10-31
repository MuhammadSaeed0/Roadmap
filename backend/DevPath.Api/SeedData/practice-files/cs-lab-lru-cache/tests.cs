public static class Tests
{
    [Test("Stores and reads values")] public static void Basic() { var c = new LruCache<string, int>(2); c.Put("a", 1); Assert.True(c.TryGet("a", out var v) && v == 1, "a = 1"); }
    [Test("Evicts the least recently used")]
    public static void Evicts()
    {
        var c = new LruCache<string, int>(2);
        c.Put("a", 1); c.Put("b", 2); c.TryGet("a", out _); c.Put("c", 3);
        Assert.False(c.TryGet("b", out _), "b should have been evicted");
        Assert.True(c.TryGet("a", out _) && c.TryGet("c", out _), "a and c stay");
    }
    [Test("Updating a key keeps one entry")] public static void Update() { var c = new LruCache<string, int>(2); c.Put("a", 1); c.Put("a", 5); Assert.Equal(1, c.Count); c.TryGet("a", out var v); Assert.Equal(5, v); }
    [Test("Never grows past its capacity")] public static void Capacity() { var c = new LruCache<int, int>(3); for (var i = 0; i < 100; i++) c.Put(i, i); Assert.Equal(3, c.Count); }
    [Test("Fast with many entries (O(1) operations)")]
    public static void Fast()
    {
        var c = new LruCache<int, int>(20_000); var watch = System.Diagnostics.Stopwatch.StartNew();
        for (var i = 0; i < 60_000; i++) { c.Put(i, i); c.TryGet(i / 2, out _); }
        Assert.True(watch.ElapsedMilliseconds < 4000, $"took {watch.ElapsedMilliseconds} ms: avoid scanning the whole cache");
    }
    [Test("Capacity must be at least 1")] public static void Invalid() => Assert.Throws<ArgumentOutOfRangeException>(() => new LruCache<int, int>(0));
}
