public class PriceLoader(PriceClient client)
{
    public async Task<Dictionary<string, decimal>> LoadAllAsync(IReadOnlyList<string> products)
    {
        var tasks = products.Select(client.GetPriceAsync).ToList();
        var prices = await Task.WhenAll(tasks);
        return products.Zip(prices).ToDictionary(x => x.First, x => x.Second);
    }

    public Task<Dictionary<string, decimal>> LoadWithTimeoutAsync(IReadOnlyList<string> products, TimeSpan timeout) =>
        LoadAllAsync(products).WaitAsync(timeout);
}
