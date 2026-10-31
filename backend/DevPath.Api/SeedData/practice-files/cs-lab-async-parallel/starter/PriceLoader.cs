public class PriceLoader(PriceClient client)
{
    public async Task<Dictionary<string, decimal>> LoadAllAsync(IReadOnlyList<string> products)
    {
        // TODO: start every request, then await them together
        throw new NotImplementedException();
    }

    public async Task<Dictionary<string, decimal>> LoadWithTimeoutAsync(IReadOnlyList<string> products, TimeSpan timeout)
    {
        throw new NotImplementedException();
    }
}
