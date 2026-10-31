public static class Tests
{
    private static Order Sample() => new()
    {
        Id = 7, CreatedAt = new DateTime(2026, 10, 1, 14, 30, 0),
        Customer = new Customer { FirstName = "Sara", LastName = "Ahmed", Email = "sara@example.com", PasswordHash = "secret-hash" },
        Lines = [new() { ProductName = "Mouse", Quantity = 2, UnitPrice = 15.99m }, new() { ProductName = "Keyboard", Quantity = 1, UnitPrice = 49.99m }],
    };

    [Test("Name, date and id")]
    public static void Header()
    {
        var dto = OrderMapping.ToDto(Sample());
        Assert.Equal(7, dto.Id);
        Assert.Equal("Sara Ahmed", dto.CustomerName);
        Assert.Equal("2026-10-01", dto.Date);
    }

    [Test("Line totals and order total")]
    public static void Totals()
    {
        var dto = OrderMapping.ToDto(Sample());
        Assert.SequenceEqual([31.98m, 49.99m], dto.Lines.Select(l => l.LineTotal));
        Assert.Equal(81.97m, dto.Total);
    }

    [Test("No email or password hash leaks into the DTO")]
    public static void NoLeaks()
    {
        var text = OrderMapping.ToDto(Sample()).ToString() + string.Join("", OrderMapping.ToDto(Sample()).Lines);
        Assert.False(text.Contains("sara@example.com") || text.Contains("secret-hash"), "the DTO exposes private customer data");
    }

    [Test("An order without lines has a total of 0")]
    public static void Empty()
    {
        var order = Sample(); order.Lines.Clear();
        Assert.Equal(0m, OrderMapping.ToDto(order).Total);
    }
}
