public class Order
{
    private readonly List<OrderLine> _lines = [];

    public int Id { get; private set; }
    public int CustomerId { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public IReadOnlyList<OrderLine> Lines => _lines;

    // The rule lives with the data it protects
    public decimal Total => _lines.Sum(l => l.Quantity * l.UnitPrice);

    public void AddLine(Product product, int quantity)
    {
        if (Status != OrderStatus.Draft) throw new InvalidOperationException("Only draft orders can change.");
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity));
        _lines.Add(new OrderLine(product.Id, quantity, product.Price));
    }
}

public record OrderLine(int ProductId, int Quantity, decimal UnitPrice);
public enum OrderStatus { Draft, Submitted, Shipped, Cancelled }
