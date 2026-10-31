public interface IClock
{
    DateTime UtcNow { get; }
}

public class TokenBucket
{
    private readonly int _capacity;
    private readonly double _refillPerSecond;
    private readonly IClock _clock;
    private double _tokens;
    private DateTime _lastRefill;

    public TokenBucket(int capacity, double refillPerSecond, IClock clock)
    {
        if (capacity < 1) throw new ArgumentOutOfRangeException(nameof(capacity));
        if (refillPerSecond <= 0) throw new ArgumentOutOfRangeException(nameof(refillPerSecond));
        _capacity = capacity;
        _refillPerSecond = refillPerSecond;
        _clock = clock;
        _tokens = capacity;
        _lastRefill = clock.UtcNow;
    }

    public bool TryTake()
    {
        var now = _clock.UtcNow;
        _tokens = Math.Min(_capacity, _tokens + (now - _lastRefill).TotalSeconds * _refillPerSecond);
        _lastRefill = now;
        if (_tokens < 1) return false;
        _tokens -= 1;
        return true;
    }
}

public class RateLimiter(int capacity, double refillPerSecond, IClock clock)
{
    private readonly Dictionary<string, TokenBucket> _buckets = [];

    public bool Allow(string clientKey)
    {
        if (!_buckets.TryGetValue(clientKey, out var bucket))
            _buckets[clientKey] = bucket = new TokenBucket(capacity, refillPerSecond, clock);
        return bucket.TryTake();
    }
}
