public record Item(string Name, int Stock);

public static class Inventory
{
    public static int RemoveOutOfStock(List<Item> items) => items.RemoveAll(i => i.Stock == 0);

    public static void Restock(List<Item> items, int threshold, int amount)
    {
        for (var i = 0; i < items.Count; i++)
            if (items[i].Stock < threshold)
                items[i] = items[i] with { Stock = items[i].Stock + amount };
    }
}
