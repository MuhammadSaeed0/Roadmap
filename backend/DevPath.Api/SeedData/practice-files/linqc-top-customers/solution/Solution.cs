public record Purchase(string Customer, decimal Amount);

public static class Reports
{
    public static List<string> TopCustomers(List<Purchase> purchases, int count) =>
        purchases.GroupBy(p => p.Customer)
            .Select(g => new { Name = g.Key, Total = g.Sum(p => p.Amount) })
            .OrderByDescending(c => c.Total).ThenBy(c => c.Name, StringComparer.Ordinal)
            .Take(count).Select(c => c.Name).ToList();
}
