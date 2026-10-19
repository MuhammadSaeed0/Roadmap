// Hot path: compiled query skips LINQ translation on every call
private static readonly Func<AppDbContext, int, Task<ProductDto?>> GetById =
    EF.CompileAsyncQuery((AppDbContext db, int id) =>
        db.Products.Where(p => p.Id == id)
            .Select(p => new ProductDto(p.Id, p.Name, p.Price))
            .FirstOrDefault());

// Complex report: parameterised raw SQL is fine (interpolation becomes parameters)
var report = await db.Database
    .SqlQuery<MonthlySales>($"""
        SELECT YEAR(o.OrderDate) AS [Year], MONTH(o.OrderDate) AS [Month], SUM(l.Quantity * l.UnitPrice) AS Total
        FROM Orders o JOIN OrderLines l ON l.OrderId = o.Id
        WHERE o.OrderDate >= {from}
        GROUP BY YEAR(o.OrderDate), MONTH(o.OrderDate)
        """)
    .ToListAsync(ct);

// Index the columns you filter and sort by
b.Entity<Order>().HasIndex(o => new { o.CustomerId, o.OrderDate });
