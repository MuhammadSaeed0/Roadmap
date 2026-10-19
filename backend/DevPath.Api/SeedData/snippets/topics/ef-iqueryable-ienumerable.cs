// ❌ AsEnumerable switches to LINQ-to-Objects: SELECT * FROM Orders, then filter in C#
var bad = db.Orders.AsEnumerable().Where(o => o.CustomerId == 5).ToList();

// ✅ Stays IQueryable: WHERE [o].[CustomerId] = @customerId runs in SQL Server
var good = await db.Orders.Where(o => o.CustomerId == 5).ToListAsync(ct);

// ❌ Hidden trap: the return type forces in-memory filtering for every caller
IEnumerable<Order> AllOrders() => db.Orders;

// ✅ Return IQueryable (or better, a finished result) from data-access code
IQueryable<Order> OrdersQuery() => db.Orders.AsNoTracking();
