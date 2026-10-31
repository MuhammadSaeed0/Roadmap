public static class Tests
{
    [Test("Removes every out-of-stock item")]
    public static void Remove()
    {
        var items = new List<Item> { new("A", 0), new("B", 0), new("C", 3) };
        Assert.Equal(2, Inventory.RemoveOutOfStock(items));
        Assert.SequenceEqual(["C"], items.Select(i => i.Name));
    }
    [Test("Nothing to remove returns 0")]
    public static void NothingToRemove()
    {
        var items = new List<Item> { new("A", 1) };
        Assert.Equal(0, Inventory.RemoveOutOfStock(items));
        Assert.Equal(1, items.Count);
    }
    [Test("Restock changes only items below the threshold")]
    public static void Restock()
    {
        var items = new List<Item> { new("A", 1), new("B", 5), new("C", 10) };
        Inventory.Restock(items, 5, 20);
        Assert.SequenceEqual([21, 5, 10], items.Select(i => i.Stock));
    }
}
