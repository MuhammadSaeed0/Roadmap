using Microsoft.EntityFrameworkCore;

public record OrderReportRow(int OrderId, string Customer, decimal Total);

public class OrderReportService(ShopContext db)
{
    // One query: EF translates the projection into a SELECT with a JOIN and a SUM sub-query.
    // A projection returns plain objects, not entities, so nothing is tracked (AsNoTracking adds nothing).
    public Task<List<OrderReportRow>> GetReport() =>
        db.Orders
            .Where(o => o.Status == "Paid")
            .OrderBy(o => o.Id)
            .Select(o => new OrderReportRow(o.Id, o.Customer.Name, o.Lines.Sum(l => l.Quantity * l.UnitPrice)))
            .ToListAsync();
}
