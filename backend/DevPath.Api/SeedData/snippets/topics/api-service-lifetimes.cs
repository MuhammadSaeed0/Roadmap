builder.Services.AddTransient<IPriceFormatter, PriceFormatter>(); // new every time
builder.Services.AddScoped<OrderService>();                        // one per HTTP request
builder.Services.AddSingleton<ICurrencyRates, CachedRates>();      // one for the app

// ❌ Captive dependency: a singleton holding a scoped DbContext
public class CachedRates(AppDbContext db) : ICurrencyRates { }

// ✅ Create a scope when a singleton really needs scoped services
public class CachedRatesFixed(IServiceScopeFactory scopes) : ICurrencyRates
{
    public async Task RefreshAsync()
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // ... use db
    }
}
