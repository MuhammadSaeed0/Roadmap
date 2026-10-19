[HttpGet]
public async Task<List<OrderListItem>> List(CancellationToken ct)
{
    var orders = await db.Orders.OrderByDescending(o => o.CreatedAt).Take(200).ToListAsync(ct);
    var result = new List<OrderListItem>();
    foreach (var order in orders)
    {
        var customer = await db.Customers.FirstAsync(c => c.Id == order.CustomerId, ct);   // runs 200 times
        result.Add(new OrderListItem(order.Id, customer.Name, order.Total, order.CreatedAt));
    }
    return result;
}
