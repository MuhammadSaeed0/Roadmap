[HttpGet]
public async Task<PagedResult<CustomerListItem>> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
    CancellationToken ct = default)
{
    pageSize = Math.Clamp(pageSize, 1, 100);
    var query = db.Customers.AsNoTracking();
    var total = await query.CountAsync(ct);
    var items = await query
        .OrderBy(c => c.Name).ThenBy(c => c.Id)
        .Skip((Math.Max(page, 1) - 1) * pageSize).Take(pageSize)
        .Select(c => new CustomerListItem(c.Id, c.Name, c.City, c.Orders.Count()))   // COUNT in SQL
        .ToListAsync(ct);
    return new PagedResult<CustomerListItem>(items, page, pageSize, total);
}
