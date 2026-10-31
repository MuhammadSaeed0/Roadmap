public static class Report
{
    private static IEnumerable<(Product Product, OrderLine Line)> Joined(List<Product> products, List<OrderLine> lines) =>
        lines.Join(products, l => l.ProductId, p => p.Id, (l, p) => (p, l));

    public static List<(string Category, decimal Revenue)> RevenueByCategory(List<Product> products, List<OrderLine> lines) =>
        Joined(products, lines)
            .GroupBy(x => x.Product.Category)
            .Select(g => (g.Key, g.Sum(x => x.Line.Quantity * x.Line.UnitPrice)))
            .OrderByDescending(x => x.Item2)
            .ToList();

    public static Dictionary<string, string> TopProductPerCategory(List<Product> products, List<OrderLine> lines) =>
        Joined(products, lines)
            .GroupBy(x => x.Product.Category)
            .ToDictionary(g => g.Key, g => g.GroupBy(x => x.Product.Name).MaxBy(p => p.Sum(x => x.Line.Quantity))!.Key);

    public static List<(int Month, decimal Revenue)> MonthlyTotals(List<OrderLine> lines)
    {
        var totals = lines.GroupBy(l => l.Month).ToDictionary(g => g.Key, g => g.Sum(l => l.Quantity * l.UnitPrice));
        return Enumerable.Range(1, 12).Select(m => (m, totals.GetValueOrDefault(m))).ToList();
    }
}
