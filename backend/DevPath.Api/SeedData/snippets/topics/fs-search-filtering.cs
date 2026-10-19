// Escape LIKE wildcards so user input is matched literally
public static string LikePattern(string term)
{
    var escaped = term.Trim().Replace("[", "[[]").Replace("%", "[%]").Replace("_", "[_]");
    return $"%{escaped}%";
}

[HttpGet]
public async Task<PagedResult<OrderListItem>> List([FromQuery] string? q, [FromQuery] OrderStatus? status,
    [FromQuery] int page = 1, CancellationToken ct = default)
{
    var query = db.Orders.AsNoTracking();
    if (!string.IsNullOrWhiteSpace(q))
    {
        var pattern = LikePattern(q.Length > 100 ? q[..100] : q);
        query = query.Where(o => EF.Functions.Like(o.Customer.Name, pattern));   // parameterised
    }
    if (status is { } s) query = query.Where(o => o.Status == s);
    return await query.ToPagedAsync(page, 20, ct);
}
