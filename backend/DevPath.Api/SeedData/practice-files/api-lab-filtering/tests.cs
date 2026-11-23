public static class Tests
{
    private static readonly IQueryable<Product> Products = new List<Product>
    {
        new(1, "Wireless Mouse", 1, 250m, new DateTime(2026, 1, 5)),
        new(2, "Gaming Mouse", 1, 900m, new DateTime(2026, 2, 1)),
        new(3, "Keyboard", 1, 600m, new DateTime(2026, 3, 9)),
        new(4, "USB Cable", 2, 80m, new DateTime(2026, 1, 20)),
        new(5, "Mouse Pad", 2, 120m, new DateTime(2026, 4, 2)),
    }.AsQueryable();

    private static int[] Ids(ProductFilter f) => ProductQuery.Apply(Products, f).Select(p => p.Id).OrderBy(i => i).ToArray();

    [Test("No filters returns every product")]
    public static void NoFilters() => Assert.SequenceEqual(new[] { 1, 2, 3, 4, 5 }, Ids(new ProductFilter()));

    [Test("A single filter: category")]
    public static void Category() => Assert.SequenceEqual(new[] { 4, 5 }, Ids(new ProductFilter(CategoryId: 2)));

    [Test("Price range")]
    public static void Range() => Assert.SequenceEqual(new[] { 1, 3 }, Ids(new ProductFilter(MinPrice: 200m, MaxPrice: 600m)));

    [Test("Search ignores case, and blank search is ignored")]
    public static void Search()
    {
        Assert.SequenceEqual(new[] { 1, 2, 5 }, Ids(new ProductFilter(Q: "MOUSE")));
        Assert.SequenceEqual(new[] { 1, 2, 3, 4, 5 }, Ids(new ProductFilter(Q: "  ")));
    }

    [Test("Filters combine")]
    public static void Combined() => Assert.SequenceEqual(new[] { 1 }, Ids(new ProductFilter(CategoryId: 1, MaxPrice: 500m, Q: "mouse")));
}
