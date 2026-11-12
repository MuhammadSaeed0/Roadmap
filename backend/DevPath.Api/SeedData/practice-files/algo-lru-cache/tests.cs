public static class Tests
{
    [Test("Returns stored values")]
    public static void T1()
    {
        var cache = new LruCache(2);
        cache.Put(1, 10);
        Assert.Equal(10, cache.Get(1));
        Assert.Equal(-1, cache.Get(2));
    }

    [Test("Removes the least recently used key")]
    public static void T2()
    {
        var cache = new LruCache(2);
        cache.Put(1, 1);
        cache.Put(2, 2);
        cache.Put(3, 3);
        Assert.Equal(-1, cache.Get(1));
        Assert.Equal(2, cache.Get(2));
        Assert.Equal(3, cache.Get(3));
    }

    [Test("Get counts as a use")]
    public static void T3()
    {
        var cache = new LruCache(2);
        cache.Put(1, 1);
        cache.Put(2, 2);
        cache.Get(1);
        cache.Put(3, 3);
        Assert.Equal(-1, cache.Get(2));
        Assert.Equal(1, cache.Get(1));
    }

    [Test("Put on an existing key updates it and counts as a use")]
    public static void T4()
    {
        var cache = new LruCache(2);
        cache.Put(1, 1);
        cache.Put(2, 2);
        cache.Put(1, 100);
        cache.Put(3, 3);
        Assert.Equal(100, cache.Get(1));
        Assert.Equal(-1, cache.Get(2));
    }
}
