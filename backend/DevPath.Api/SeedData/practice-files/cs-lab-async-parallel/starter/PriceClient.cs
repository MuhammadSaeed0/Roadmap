public class PriceClient
{
    private static readonly Dictionary<string, decimal> Prices = new() { ["keyboard"] = 49.99m, ["mouse"] = 15.99m, ["monitor"] = 249m };

    public async Task<decimal> GetPriceAsync(string product)
    {
        await Task.Delay(300);   // pretend this is a web request
        return Prices.TryGetValue(product, out var price) ? price : throw new KeyNotFoundException(product);
    }
}
