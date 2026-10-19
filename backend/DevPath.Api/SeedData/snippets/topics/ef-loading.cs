// Eager loading: one query with JOINs
var order = await db.Orders
    .Include(o => o.Customer)
    .Include(o => o.Lines).ThenInclude(l => l.Product)
    .AsSplitQuery()                 // separate queries per collection, avoids row explosion
    .FirstOrDefaultAsync(o => o.Id == id, ct);

// Explicit loading: load a navigation later
var customer = await db.Customers.FirstAsync(c => c.Id == customerId, ct);
await db.Entry(customer).Collection(c => c.Orders).LoadAsync(ct);

// Often best: project exactly what the screen needs
var rows = await db.Orders
    .Select(o => new { o.Id, o.Date, Customer = o.Customer.Name, Total = o.Lines.Sum(l => l.Quantity * l.UnitPrice) })
    .ToListAsync(ct);
