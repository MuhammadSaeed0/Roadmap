public record ProductQuery(string? Q, int? CategoryId, decimal? MinPrice, decimal? MaxPrice);

IQueryable<Product> query = db.Products.AsNoTracking();

if (!string.IsNullOrWhiteSpace(filter.Q))
    query = query.Where(p => p.Name.Contains(filter.Q));    // LIKE @p0 (parameterised)
if (filter.CategoryId is { } categoryId)
    query = query.Where(p => p.CategoryId == categoryId);
if (filter.MinPrice is { } min)
    query = query.Where(p => p.Price >= min);
if (filter.MaxPrice is { } max)
    query = query.Where(p => p.Price <= max);

// Still ONE SQL statement, with only the active filters in its WHERE clause
var results = await query.Take(50).ToListAsync(ct);
