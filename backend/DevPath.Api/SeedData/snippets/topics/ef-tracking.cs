// Read-only: no change tracking overhead
var products = await db.Products
    .AsNoTracking()
    .Where(p => p.Stock > 0)
    .ToListAsync(ct);

// Projection to a DTO is never tracked
var dtos = await db.Products
    .Select(p => new ProductDto(p.Id, p.Name, p.Price))
    .ToListAsync(ct);

// Update: tracking IS required
var product = await db.Products.FirstAsync(p => p.Id == id, ct);
product.Price = 59m;
await db.SaveChangesAsync(ct);      // EF detected the change

Console.WriteLine(db.ChangeTracker.Entries().Count());
