public sealed class ModelException(int status, TimeSpan? retryAfter = null) : Exception($"HTTP {status}")
{
    public int Status { get; } = status;
    public TimeSpan? RetryAfter { get; } = retryAfter;
}

public static class Retry
{
    /// <summary>429, 408 and 5xx are worth retrying; everything else is not.</summary>
    public static bool IsTransient(int status) => false;

    /// <summary>
    /// Calls the operation up to maxAttempts times. On a transient ModelException it waits and tries again: the
    /// exception's RetryAfter when it has one, otherwise 1, 2, 4... seconds (doubling). Waiting goes through the delay
    /// function so tests don't really sleep. Non-transient errors, and the last failure, are rethrown.
    /// </summary>
    public static Task<T> RunAsync<T>(Func<int, Task<T>> operation, int maxAttempts, Func<TimeSpan, Task> delay) =>
        operation(1);
}
