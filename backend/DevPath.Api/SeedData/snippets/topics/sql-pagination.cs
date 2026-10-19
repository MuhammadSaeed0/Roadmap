// Keyset ("seek") pagination: fast on page 1 and page 10,000
public async Task<(List<OrderDto> Items, int? NextCursor)> PageAsync(int? afterId, int size, CancellationToken ct)
{
    var query = db.Orders.AsNoTracking();
    if (afterId is { } cursor)
        query = query.Where(o => o.Id > cursor);        // uses the clustered index

    var items = await query
        .OrderBy(o => o.Id)
        .Take(size + 1)                                   // one extra row tells us if there's more
        .Select(o => new OrderDto(o.Id, o.OrderDate, o.Total))
        .ToListAsync(ct);

    int? next = items.Count > size ? items[size - 1].Id : null;
    return (items.Take(size).ToList(), next);
}
