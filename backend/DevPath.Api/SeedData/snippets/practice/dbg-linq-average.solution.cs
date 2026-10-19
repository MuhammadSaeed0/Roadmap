var averages = reviews
    .GroupBy(r => r.ProductName)
    .Select(g => new
    {
        Product = g.Key,
        Average = Math.Round(g.Average(r => r.Stars), 2)   // Average returns double
    })
    .ToList();
