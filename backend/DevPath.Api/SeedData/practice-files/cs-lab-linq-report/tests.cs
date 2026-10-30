public static class Tests
{
    private static readonly List<Product> P = Data.Products();
    private static readonly List<OrderLine> L = Data.Lines();

    [Test("Revenue per category, highest first")]
    public static void Revenue()
    {
        var r = Report.RevenueByCategory(P, L);
        Assert.SequenceEqual(["Audio", "Displays", "Input"], r.Select(x => x.Category));
        Assert.Equal(833m, r[0].Revenue);
    }
    [Test("Best-selling product per category")]
    public static void Top()
    {
        var t = Report.TopProductPerCategory(P, L);
        Assert.Equal("Speakers", t["Audio"]);
        Assert.Equal("Mouse", t["Input"]);
    }
    [Test("Twelve months, in order")] public static void Months() => Assert.SequenceEqual(Enumerable.Range(1, 12), Report.MonthlyTotals(L).Select(m => m.Month));
    [Test("Months without sales are 0")] public static void Empty() => Assert.Equal(0m, Report.MonthlyTotals(L)[3].Revenue);
    [Test("Month totals are summed")] public static void January() => Assert.Equal(307m, Report.MonthlyTotals(L)[0].Revenue);
}
