public async Task<ProductDto?> GetProductAsync(int id, CancellationToken ct)
{
    var product = await db.Products.AsNoTracking()
        .FirstOrDefaultAsync(p => p.Id == id, ct);   // thread is free while SQL runs

    return product is null ? null : new ProductDto(product.Id, product.Name, product.Price);
}

// Run independent I/O concurrently
var pricesTask = http.GetStringAsync("https://example.com/prices");
var stockTask = http.GetStringAsync("https://example.com/stock");
await Task.WhenAll(pricesTask, stockTask);

// ❌ Never block on async code:
// var p = GetProductAsync(1, ct).Result;
