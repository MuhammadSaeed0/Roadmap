public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

public async Task<PagedResult<ProductDto>> ListAsync(int page, int pageSize, CancellationToken ct)
{
    page = Math.Max(1, page);
    pageSize = Math.Clamp(pageSize, 1, 100);     // never let a client ask for 1,000,000 rows

    var query = db.Products.AsNoTracking();
    var total = await query.CountAsync(ct);

    var items = await query
        .OrderBy(p => p.Name).ThenBy(p => p.Id)  // deterministic order
        .Skip((page - 1) * pageSize)             // OFFSET
        .Take(pageSize)                          // FETCH NEXT
        .Select(p => new ProductDto(p.Id, p.Name, p.Price))
        .ToListAsync(ct);

    return new PagedResult<ProductDto>(items, page, pageSize, total);
}
