// Program.cs
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(cs));   // scoped
builder.Services.AddSingleton<PriceCache>();                            // singleton

public class PriceCache(AppDbContext db)        // captured forever, shared by all requests
{
    public Task<decimal> GetPriceAsync(int productId) =>
        db.Products.Where(p => p.Id == productId).Select(p => p.Price).FirstAsync();
}
