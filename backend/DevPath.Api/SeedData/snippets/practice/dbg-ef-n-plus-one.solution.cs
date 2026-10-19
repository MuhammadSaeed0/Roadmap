[HttpGet]
public Task<List<OrderListItem>> List(CancellationToken ct) =>
    db.Orders.AsNoTracking()
        .OrderByDescending(o => o.CreatedAt)
        .Take(200)
        .Select(o => new OrderListItem(o.Id, o.Customer.Name, o.Total, o.CreatedAt))   // one query with a JOIN
        .ToListAsync(ct);
