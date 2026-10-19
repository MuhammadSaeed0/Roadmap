var averages = reviews
    .GroupBy(r => r.ProductName)
    .Select(g => new
    {
        Product = g.Key,
        Average = g.Sum(r => r.Stars) / g.Count()    // Stars is int
    })
    .ToList();
// Keyboard: 4 (expected 4.5), Mouse: 3 (expected 3.67)
