public class FakeClock : IClock
{
    public DateTime UtcNow { get; set; } = new(2026, 1, 1, 12, 0, 0, DateTimeKind.Utc);
    public void Advance(double seconds) => UtcNow = UtcNow.AddSeconds(seconds);
}

public static class Tests
{
    [Test("Allows a burst up to the capacity")]
    public static void Burst()
    {
        var b = new TokenBucket(3, 1, new FakeClock());
        Assert.True(b.TryTake() && b.TryTake() && b.TryTake(), "three calls are allowed");
        Assert.False(b.TryTake(), "the fourth is refused");
    }
    [Test("Refills over time")]
    public static void Refill()
    {
        var clock = new FakeClock(); var b = new TokenBucket(3, 1, clock);
        for (var i = 0; i < 3; i++) b.TryTake();
        clock.Advance(0.5); Assert.False(b.TryTake(), "half a token isn't enough");
        clock.Advance(0.5); Assert.True(b.TryTake(), "one token after a second");
    }
    [Test("Never holds more than the capacity")]
    public static void Cap()
    {
        var clock = new FakeClock(); var b = new TokenBucket(3, 1, clock);
        clock.Advance(3600);
        var allowed = 0; while (b.TryTake()) allowed++;
        Assert.Equal(3, allowed);
    }
    [Test("Clients have separate buckets")]
    public static void Clients()
    {
        var l = new RateLimiter(1, 1, new FakeClock());
        Assert.True(l.Allow("a"), "a's first call");
        Assert.False(l.Allow("a"), "a's second call");
        Assert.True(l.Allow("b"), "b has its own bucket");
    }
    [Test("Uses the injected clock, not DateTime.Now")]
    public static void InjectedClock()
    {
        var clock = new FakeClock { UtcNow = new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc) };
        var b = new TokenBucket(1, 0.001, clock);
        Assert.True(b.TryTake(), "first token");
        Assert.False(b.TryTake(), "no refill without the fake clock moving");
    }
}
