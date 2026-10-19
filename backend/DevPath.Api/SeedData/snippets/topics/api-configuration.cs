// appsettings.json
// { "Store": { "Name": "DevPath Shop", "MaxItemsPerOrder": 50 } }

public class StoreOptions
{
    public string Name { get; set; } = "";
    public int MaxItemsPerOrder { get; set; } = 20;
}

builder.Services.Configure<StoreOptions>(builder.Configuration.GetSection("Store"));

public class OrderValidator(IOptions<StoreOptions> options)
{
    public bool IsTooLarge(int items) => items > options.Value.MaxItemsPerOrder;
}

// Secrets stay out of Git:
//   dotnet user-secrets set "ConnectionStrings:Default" "Server=...;Password=..."
