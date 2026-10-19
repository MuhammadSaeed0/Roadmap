// ✅ thread is released while SQL Server works
var orders = await db.Orders.Where(o => o.CustomerId == id).ToListAsync(ct);

// ❌ blocks a thread-pool thread for the whole call
var orders2 = db.Orders.Where(o => o.CustomerId == id).ToListAsync().Result;
