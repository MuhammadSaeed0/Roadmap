using Microsoft.EntityFrameworkCore;

public record OrderReportRow(int OrderId, string Customer, decimal Total);

public class OrderReportService(ShopContext db)
{
    public async Task<List<OrderReportRow>> GetReport()
    {
        var rows = new List<OrderReportRow>();
        var orders = await db.Orders.Where(o => o.Status == "Paid").OrderBy(o => o.Id).ToListAsync();
        foreach (var order in orders)
        {
            // Each navigation property access below triggers another query (lazy loading).
            var total = order.Lines.Sum(l => l.Quantity * l.UnitPrice);
            rows.Add(new OrderReportRow(order.Id, order.Customer.Name, total));
        }
        return rows;
    }
}
