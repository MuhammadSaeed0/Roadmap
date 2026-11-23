public static class Tests
{
    [Test("A small invoice: no discount, 14 % VAT")]
    public static void Small() => Assert.Equal(114m, Invoice.Total([new("Cable", 2, 50m)]));

    [Test("Exactly 1000 gets the discount")]
    public static void Boundary() => Assert.Equal(1026m, Invoice.Total([new("Monitor", 1, 1000m)]));

    [Test("VAT is calculated on the discounted amount")]
    public static void VatAfterDiscount() => Assert.Equal(2052m, Invoice.Total([new("Laptop", 1, 2000m)]));

    [Test("Prices with piasters are not rounded per line")]
    public static void Piasters() => Assert.Equal(1035.70m, Invoice.Total([new("Pen", 1, 9.49m), new("Book", 4, 249.99m)]));

    [Test("An empty invoice costs nothing")]
    public static void Empty() => Assert.Equal(0m, Invoice.Total([]));
}
