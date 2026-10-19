// Nothing is sent to SQL Server yet
db.Products.Add(new Product { Name = "Keyboard", Price = 49.99m, Stock = 10 });
db.Products.Add(new Product { Name = "Mouse", Price = 19.99m, Stock = 25 });

// One round trip: INSERT ... ; INSERT ... ; (in a transaction)
await db.SaveChangesAsync(ct);

// Queries run when materialised
var cheap = await db.Products.Where(p => p.Price < 30).ToListAsync(ct);

// FindAsync returns a tracked entity without a query if it's already loaded
var product = await db.Products.FindAsync([id], ct);
