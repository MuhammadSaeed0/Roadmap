var cache = new LruCache(2);
cache.Put(1, 1);
cache.Put(2, 2);
Console.WriteLine(cache.Get(1));
cache.Put(3, 3);
Console.WriteLine(cache.Get(2));
