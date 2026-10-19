// ❌ N+1: one query for orders, then one query PER order
var orders = await db.Orders.AsNoTracking().ToListAsync(ct);
foreach (var o in orders)
{
    var customer = await db.Customers.FindAsync([o.CustomerId], ct);   // runs N times
    Console.WriteLine($"{o.Id}: {customer!.Name}");
}

// ✅ One query with a JOIN
var rows = await db.Orders.AsNoTracking()
    .Select(o => new { o.Id, CustomerName = o.Customer.Name })
    .ToListAsync(ct);

// ✅ Or: load the related rows in one batch and join in memory
var ids = orders.Select(o => o.CustomerId).Distinct().ToList();
var names = await db.Customers.Where(c => ids.Contains(c.Id)).ToDictionaryAsync(c => c.Id, c => c.Name, ct);
