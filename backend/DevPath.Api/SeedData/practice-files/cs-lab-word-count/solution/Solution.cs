public static class Sales
{
    public static Dictionary<string, int> Count(IEnumerable<string> products)
    {
        var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var name in products)
            counts[name] = counts.TryGetValue(name, out var n) ? n + 1 : 1;
        return counts;
    }

    public static string? TopProduct(IEnumerable<string> products) =>
        Count(products).OrderByDescending(p => p.Value).Select(p => p.Key).FirstOrDefault();
}
