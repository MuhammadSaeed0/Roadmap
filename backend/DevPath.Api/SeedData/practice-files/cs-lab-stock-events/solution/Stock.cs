public record PriceChangedEventArgs(decimal OldPrice, decimal NewPrice);

public class Stock(string symbol, decimal price)
{
    private decimal _price = price;

    public string Symbol { get; } = symbol;
    public event EventHandler<PriceChangedEventArgs>? PriceChanged;

    public decimal Price
    {
        get => _price;
        set
        {
            if (value < 0) throw new ArgumentOutOfRangeException(nameof(value), "A price can't be negative.");
            if (value == _price) return;
            var old = _price;
            _price = value;
            PriceChanged?.Invoke(this, new PriceChangedEventArgs(old, value));
        }
    }
}
