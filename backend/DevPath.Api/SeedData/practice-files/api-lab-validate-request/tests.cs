public static class Tests
{
    private static CreateProductRequest Valid() => new("Keyboard", 49.99m, 10, "Input", "KEY-1234");

    [Test("A valid request has no errors")]
    public static void ValidRequest() => Assert.Equal(0, RequestValidator.Validate(Valid()).Count);

    [Test("Only the broken fields are reported")]
    public static void BrokenFields()
    {
        var errors = RequestValidator.Validate(Valid() with { Name = " ", Price = -1 });
        Assert.SequenceEqual(["Name", "Price"], errors.Keys.Order());
    }

    [Test("Name length, stock and category rules")]
    public static void OtherRules()
    {
        var errors = RequestValidator.Validate(Valid() with { Name = new string('x', 101), Stock = -2, Category = "Toys" });
        Assert.SequenceEqual(["Category", "Name", "Stock"], errors.Keys.Order());
    }

    [Test("SKU pattern")]
    public static void Sku()
    {
        Assert.True(RequestValidator.Validate(Valid() with { Sku = "key-1234" }).ContainsKey("Sku"), "lower-case SKU should fail");
        Assert.True(RequestValidator.Validate(Valid() with { Sku = "KEY-123" }).ContainsKey("Sku"), "short SKU should fail");
        Assert.False(RequestValidator.Validate(Valid() with { Sku = "ABC-0001" }).ContainsKey("Sku"), "ABC-0001 is valid");
    }
}
