// ❌ Read-modify-write: two requests can both see Stock = 1
var product = await db.Products.FindAsync([id], ct);
if (product!.Stock >= qty) { product.Stock -= qty; await db.SaveChangesAsync(ct); }

// ✅ Atomic conditional update: one statement, checked by SQL Server
var updated = await db.Products
    .Where(p => p.Id == id && p.Stock >= qty)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - qty), ct);
// UPDATE Products SET Stock = Stock - @qty WHERE Id = @id AND Stock >= @qty

if (updated == 0)
    throw new BusinessRuleException("out_of_stock", "Not enough stock.");
