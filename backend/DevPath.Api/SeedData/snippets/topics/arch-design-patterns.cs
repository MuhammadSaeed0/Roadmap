// Strategy: one class per discount rule, chosen at runtime.
public interface IDiscountStrategy
{
    bool AppliesTo(Order order);
    decimal Discount(Order order);
}

public sealed class LoyaltyDiscount : IDiscountStrategy
{
    public bool AppliesTo(Order order) => order.Customer.YearsAsCustomer >= 3;
    public decimal Discount(Order order) => order.Total * 0.05m;
}

public sealed class CouponDiscount(ICouponStore coupons) : IDiscountStrategy
{
    public bool AppliesTo(Order order) => order.CouponCode is not null;
    public decimal Discount(Order order) => coupons.ValueOf(order.CouponCode!);
}

// Factory: picks the strategy, so callers don't need a switch.
public sealed class DiscountCalculator(IEnumerable<IDiscountStrategy> strategies)
{
    public decimal BestDiscount(Order order) =>
        strategies.Where(s => s.AppliesTo(order)).Select(s => s.Discount(order)).DefaultIfEmpty(0).Max();
}

// Decorator: adds caching around an existing service without changing it.
public sealed class CachedProductService(IProductService inner, IMemoryCache cache) : IProductService
{
    public Task<ProductDto?> GetAsync(int id, CancellationToken ct) =>
        cache.GetOrCreateAsync($"product:{id}", entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            return inner.GetAsync(id, ct);
        });
}

// Program.cs: every IDiscountStrategy is injected into DiscountCalculator.
builder.Services.AddScoped<IDiscountStrategy, LoyaltyDiscount>();
builder.Services.AddScoped<IDiscountStrategy, CouponDiscount>();
builder.Services.AddScoped<DiscountCalculator>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<IProductService>(sp =>
    new CachedProductService(sp.GetRequiredService<ProductService>(), sp.GetRequiredService<IMemoryCache>()));
