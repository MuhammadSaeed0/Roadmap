public static class Report
{
    public static List<(string Category, decimal Revenue)> RevenueByCategory(List<Product> products, List<OrderLine> lines) => throw new NotImplementedException();

    public static Dictionary<string, string> TopProductPerCategory(List<Product> products, List<OrderLine> lines) => throw new NotImplementedException();

    public static List<(int Month, decimal Revenue)> MonthlyTotals(List<OrderLine> lines) => throw new NotImplementedException();
}
