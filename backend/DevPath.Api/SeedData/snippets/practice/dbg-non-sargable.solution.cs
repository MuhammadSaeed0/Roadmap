var from = new DateTime(2026, 1, 1);
var to = from.AddYears(1);

var orders2026 = await db.Orders
    .Where(o => o.OrderDate >= from && o.OrderDate < to)   // sargable half-open range
    .CountAsync(ct);

// SELECT COUNT(*) FROM [Orders] AS [o] WHERE [o].[OrderDate] >= @from AND [o].[OrderDate] < @to
