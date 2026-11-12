public class Inventory
{
    private readonly Dictionary<string, int> _stock = new(StringComparer.OrdinalIgnoreCase);

    public void Add(string product, int quantity)
    {
        if (quantity <= 0) throw new ArgumentException("Quantity must be positive.", nameof(quantity));
        _stock[product] = QuantityOf(product) + quantity;
    }

    public void Remove(string product, int quantity)
    {
        if (quantity <= 0) throw new ArgumentException("Quantity must be positive.", nameof(quantity));
        if (QuantityOf(product) < quantity) throw new InvalidOperationException("Not enough stock.");
        _stock[product] -= quantity;
    }

    public int QuantityOf(string product) => _stock.GetValueOrDefault(product);

    public List<string> LowStock(int threshold) =>
        _stock.Where(p => p.Value < threshold).Select(p => p.Key).OrderBy(n => n, StringComparer.Ordinal).ToList();
}
