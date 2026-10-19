// N+1
foreach (var o in await db.Orders.ToListAsync())
    Console.WriteLine((await db.Customers.FindAsync(o.CustomerId))!.Name);

// 1 query
var rows = await db.Orders.Select(o => new { o.Id, o.Customer.Name }).ToListAsync();
