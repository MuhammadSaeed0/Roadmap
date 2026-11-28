using System.Collections.Concurrent;

namespace DevPath.Api.Services;

/// <summary>
/// Keeps read-only catalogue data (roadmaps, phases, topics, interview questions) in memory. That content changes only
/// when the seeder runs at start-up, while the hosted database answers each query slowly (often 0.5–5 s), so loading it
/// once per process instead of once per request is the biggest saving. Personal data (progress, ratings) is never
/// cached here. Draft content is cached separately for those who can see drafts, so learners never receive it.
/// Anything that changes content while the app runs (tests that insert rows directly) must call <see cref="Clear"/>.
/// </summary>
public class ContentCache
{
    private readonly ConcurrentDictionary<string, Lazy<Task<object>>> _entries = new();

    /// <summary>
    /// The cached value for <paramref name="key"/>, loading it once with <paramref name="load"/>. The load must not use
    /// the request's cancellation token, since other requests may await the same result. A failed load isn't kept.
    /// </summary>
    public async Task<T> GetAsync<T>(string key, bool drafts, Func<Task<T>> load) where T : class
    {
        var fullKey = drafts ? key + ":drafts" : key;
        var entry = _entries.GetOrAdd(fullKey, _ => new Lazy<Task<object>>(async () => await load()));
        try
        {
            return (T)await entry.Value;
        }
        catch
        {
            _entries.TryRemove(new KeyValuePair<string, Lazy<Task<object>>>(fullKey, entry));
            throw;
        }
    }

    public void Clear() => _entries.Clear();
}
