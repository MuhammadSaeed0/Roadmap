namespace Inventory.Services;   // file-scoped namespace

// Primary constructor: parameters available in the whole class
public class StockService(AppDbContext db, ILogger<StockService> logger)
{
    public async Task<int> CountLowStockAsync(CancellationToken ct)
    {
        var count = await db.Products.CountAsync(p => p.Stock < 10, ct);
        logger.LogInformation("{Count} products are low on stock", count);
        return count;
    }
}

public class CreateProduct
{
    public required string Name { get; init; }   // must be set by the caller
    public decimal Price { get; init; }
}

int[] ids = [1, 2, 3];                  // collection expression
List<string> tags = ["new", "sale"];

var sql = """
    SELECT Name, Price
    FROM Products
    WHERE Name LIKE '%"Pro"%'
    """;
