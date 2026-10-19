var report = orders
    .SelectMany(o => o.Lines, (o, l) => new { o.Date, Line = l })
    .GroupBy(x => new { x.Date.Year, x.Date.Month, x.Line.Category })
    .Select(g => new
    {
        g.Key.Year,
        g.Key.Month,
        g.Key.Category,
        Total = g.Sum(x => x.Line.Quantity * x.Line.UnitPrice)
    })
    .OrderBy(r => r.Year).ThenBy(r => r.Month).ThenByDescending(r => r.Total)
    .ToList();
