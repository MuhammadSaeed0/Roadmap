public record Money(decimal Amount)
{
    public static Money Zero => new(0m);
    public Money Add(Money other) => new(Amount + other.Amount);
}

public enum OrderStatus { Draft, Submitted }

public record OrderLine(string Sku, int Quantity, Money UnitPrice)
{
    public Money Total => new(UnitPrice.Amount * Quantity);
}

public class Order
{
    private readonly List<OrderLine> _lines = [];

    public IReadOnlyList<OrderLine> Lines => _lines;
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;

    public Money Total => _lines.Aggregate(Money.Zero, (sum, line) => sum.Add(line.Total));

    public void AddLine(string sku, int quantity, Money unitPrice)
    {
        if (Status != OrderStatus.Draft) throw new InvalidOperationException("A submitted order can't change.");
        var index = _lines.FindIndex(l => l.Sku == sku);
        var newQuantity = quantity + (index >= 0 ? _lines[index].Quantity : 0);
        if (quantity < 1 || newQuantity > 100) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be 1–100.");
        if (index >= 0) _lines[index] = _lines[index] with { Quantity = newQuantity };
        else _lines.Add(new OrderLine(sku, quantity, unitPrice));
    }

    public void Submit()
    {
        if (_lines.Count == 0) throw new InvalidOperationException("An empty order can't be submitted.");
        Status = OrderStatus.Submitted;
    }
}
