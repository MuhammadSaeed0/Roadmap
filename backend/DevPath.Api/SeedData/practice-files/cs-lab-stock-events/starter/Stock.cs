public record PriceChangedEventArgs(decimal OldPrice, decimal NewPrice);

public class Stock(string symbol, decimal price)
{
    public string Symbol { get; } = symbol;

    // TODO: the PriceChanged event and a Price property that raises it
    public decimal Price { get; set; } = price;
}
