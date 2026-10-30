public class PriceClient
{
    private static readonly Dictionary<string, decimal> Prices = new() { ["keyboard"] = 49.99m, ["mouse"] = 15.99m, ["monitor"] = 249m };
    private int running;

    /// <summary>The most requests that were in flight at the same time.</summary>
    public int MostAtOnce { get; private set; }

    public async Task<decimal> GetPriceAsync(string product)
    {
        MostAtOnce = Math.Max(MostAtOnce, Interlocked.Increment(ref running));
        try
        {
            await Task.Delay(300);   // pretend this is a web request
            return Prices.TryGetValue(product, out var price) ? price : throw new KeyNotFoundException(product);
        }
        finally
        {
            Interlocked.Decrement(ref running);
        }
    }
}
