public record Item(string Name, int Stock);

public static class Inventory
{
    public static int RemoveOutOfStock(List<Item> items)
    {
        var removed = 0;
        foreach (var item in items)
        {
            if (item.Stock == 0)
            {
                items.Remove(item);
                removed++;
            }
        }
        return removed;
    }

    public static void Restock(List<Item> items, int threshold, int amount)
    {
        foreach (var item in items)
        {
            var updated = item;
            if (item.Stock <= threshold) updated = item with { Stock = item.Stock + amount };
        }
    }
}
