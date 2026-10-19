IQueryable<Product> ApplySort(IQueryable<Product> q, string? sortBy, bool desc) =>
    (sortBy?.ToLowerInvariant(), desc) switch
    {
        ("price", false) => q.OrderBy(p => p.Price).ThenBy(p => p.Id),
        ("price", true)  => q.OrderByDescending(p => p.Price).ThenBy(p => p.Id),
        ("stock", false) => q.OrderBy(p => p.Stock).ThenBy(p => p.Id),
        ("stock", true)  => q.OrderByDescending(p => p.Stock).ThenBy(p => p.Id),
        (_, true)        => q.OrderByDescending(p => p.Name).ThenBy(p => p.Id),
        _                => q.OrderBy(p => p.Name).ThenBy(p => p.Id)   // allow-list default
    };

// Sort BEFORE paging, otherwise you only sort the current page
var page = await ApplySort(query, sortBy, desc).Skip(skip).Take(size).ToListAsync(ct);
