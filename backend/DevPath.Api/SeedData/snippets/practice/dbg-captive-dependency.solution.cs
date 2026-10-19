// Option 1: match the lifetime of its dependency
builder.Services.AddScoped<PriceCache>();

// Option 2: stay singleton (e.g. to keep a cache) and create a scope per use
public class PriceCache(IServiceScopeFactory scopes)
{
    public async Task<decimal> GetPriceAsync(int productId)
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db.Products.Where(p => p.Id == productId).Select(p => p.Price).FirstAsync();
    }
}
