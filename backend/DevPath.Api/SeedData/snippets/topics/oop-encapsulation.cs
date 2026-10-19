public class Product
{
    public Product(string name, int stock)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.", nameof(name));
        if (stock < 0) throw new ArgumentOutOfRangeException(nameof(stock));
        Name = name;
        Stock = stock;
    }

    public string Name { get; }
    public int Stock { get; private set; }   // can only change through methods

    public bool TryRemoveStock(int quantity)
    {
        if (quantity <= 0 || quantity > Stock) return false;
        Stock -= quantity;
        return true;
    }
}
