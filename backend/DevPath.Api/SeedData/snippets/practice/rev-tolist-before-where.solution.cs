// Prefer specific query methods that filter and project in SQL:
public Task<List<OrderListItem>> RecentAsync(DateTime since, int take, CancellationToken ct) =>
    db.Orders.AsNoTracking()
        .Where(o => o.CreatedAt > since)
        .OrderByDescending(o => o.CreatedAt)
        .Take(take)
        .Select(o => new OrderListItem(o.Id, o.Customer.Name, o.Total, o.CreatedAt))
        .ToListAsync(ct);

// If a generic helper must stay, at least keep it composable:
public IQueryable<T> Query() => db.Set<T>().AsNoTracking();
