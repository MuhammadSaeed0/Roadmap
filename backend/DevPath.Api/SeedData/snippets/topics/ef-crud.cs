// Create
var category = new Category { Name = "Peripherals" };
db.Categories.Add(category);
await db.SaveChangesAsync(ct);

// Read (no tracking needed)
var list = await db.Categories.AsNoTracking().OrderBy(c => c.Name).ToListAsync(ct);

// Update: load, change, save → UPDATE with only the changed column
var c = await db.Categories.FindAsync([id], ct) ?? throw new NotFoundException("Category", id);
c.Name = "Computer peripherals";
await db.SaveChangesAsync(ct);

// Delete
db.Categories.Remove(c);
await db.SaveChangesAsync(ct);

// Set-based operations without loading entities
await db.Products.Where(p => p.CategoryId == id)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Price, p => p.Price * 1.05m), ct);
await db.Products.Where(p => p.Discontinued).ExecuteDeleteAsync(ct);
