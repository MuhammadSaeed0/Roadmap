public static class Tests
{
    private static readonly IQueryable<Product> Products = new List<Product>
    {
        new(3, "Keyboard", 1, 600m, new DateTime(2026, 3, 9)),
        new(1, "Wireless Mouse", 1, 250m, new DateTime(2026, 1, 5)),
        new(5, "Mouse Pad", 2, 250m, new DateTime(2026, 4, 2)),
        new(4, "USB Cable", 2, 80m, new DateTime(2026, 1, 20)),
        new(2, "Gaming Mouse", 1, 900m, new DateTime(2026, 2, 1)),
    }.AsQueryable();

    private static int[] Ids(string? sortBy, bool desc = false) => ProductSorting.Apply(Products, sortBy, desc).Select(p => p.Id).ToArray();

    [Test("No sortBy sorts by Id")]
    public static void Default() => Assert.SequenceEqual(new[] { 1, 2, 3, 4, 5 }, Ids(null));

    [Test("Sort by name, ascending and descending")]
    public static void ByName()
    {
        Assert.SequenceEqual(new[] { 2, 3, 5, 4, 1 }, Ids("name"));
        Assert.SequenceEqual(new[] { 1, 4, 5, 3, 2 }, Ids("Name", desc: true));
    }

    [Test("Sort by price breaks ties by Id")]
    public static void ByPrice()
    {
        Assert.SequenceEqual(new[] { 4, 1, 5, 3, 2 }, Ids("price"));
        Assert.SequenceEqual(new[] { 2, 3, 1, 5, 4 }, Ids("PRICE", desc: true));
    }

    [Test("Sort by creation date")]
    public static void ByCreated() => Assert.SequenceEqual(new[] { 1, 4, 2, 3, 5 }, Ids("created"));

    [Test("Fields outside the allow-list are rejected")]
    public static void AllowList()
    {
        Assert.Throws<ArgumentException>(() => ProductSorting.Apply(Products, "CategoryId", false));
        Assert.Throws<ArgumentException>(() => ProductSorting.Apply(Products, "price; DROP TABLE Products", false));
    }
}
