// Index: IX_Orders_OrderDate
var orders2026 = await db.Orders
    .Where(o => o.OrderDate.Year == 2026)
    .CountAsync(ct);

// Generated SQL:
// SELECT COUNT(*) FROM [Orders] AS [o] WHERE DATEPART(year, [o].[OrderDate]) = 2026
