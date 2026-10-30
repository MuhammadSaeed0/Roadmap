public static class Tests
{
    private static IQueryable<Product> Data() => new List<Product>
    {
        new() { Id = 1, Name = "Mouse", Category = "Input", Price = 15.99m },
        new() { Id = 2, Name = "Monitor", Category = "Display", Price = 249m },
        new() { Id = 3, Name = "Keyboard", Category = "Input", Price = 49.99m },
        new() { Id = 4, Name = "Mousepad", Category = "Input", Price = 9.50m },
        new() { Id = 5, Name = "Headset", Category = "Audio", Price = 79m },
    }.AsQueryable();

    [Test("Search, sort by -price and page")]
    public static void SearchSortPage()
    {
        var r = ProductQueries.Search(Data(), new ProductQuery(Search: "MO", Sort: "-price", PageSize: 2));
        Assert.Equal(3, r.Total);
        Assert.SequenceEqual(["Monitor", "Mouse"], r.Items.Select(p => p.Name));
        var page2 = ProductQueries.Search(Data(), new ProductQuery(Search: "MO", Sort: "-price", Page: 2, PageSize: 2));
        Assert.SequenceEqual(["Mousepad"], page2.Items.Select(p => p.Name));
    }

    [Test("Category and price range filters")]
    public static void Filters()
    {
        var r = ProductQueries.Search(Data(), new ProductQuery(Category: "Input", MinPrice: 10, MaxPrice: 50, Sort: "price"));
        Assert.SequenceEqual(["Mouse", "Keyboard"], r.Items.Select(p => p.Name));
    }

    [Test("Unknown sort falls back to name")]
    public static void DefaultSort()
    {
        var r = ProductQueries.Search(Data(), new ProductQuery(Sort: "drop table"));
        Assert.SequenceEqual(["Headset", "Keyboard", "Monitor", "Mouse", "Mousepad"], r.Items.Select(p => p.Name));
    }

    [Test("Page and page size are clamped")]
    public static void Clamp()
    {
        var r = ProductQueries.Search(Data(), new ProductQuery(Page: 0, PageSize: 1000));
        Assert.Equal(1, r.Page);
        Assert.Equal(50, r.PageSize);
        Assert.Equal(5, r.Items.Count);
    }
}
