public interface IClock
{
    DateTime UtcNow { get; }
}

public class TokenBucket(int capacity, double refillPerSecond, IClock clock)
{
    public bool TryTake() => throw new NotImplementedException();
}

public class RateLimiter(int capacity, double refillPerSecond, IClock clock)
{
    public bool Allow(string clientKey) => throw new NotImplementedException();
}
