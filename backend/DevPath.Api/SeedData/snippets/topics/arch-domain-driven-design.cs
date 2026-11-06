public sealed record Money(decimal Amount, string Currency)
{
    public static Money operator +(Money a, Money b) =>
        a.Currency == b.Currency ? a with { Amount = a.Amount + b.Amount }
                                 : throw new InvalidOperationException("Currencies differ.");
}

public sealed class Order // aggregate root
{
    private readonly List<OrderLine> _lines = [];
    private readonly List<object> _events = [];

    public int Id { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public IReadOnlyList<OrderLine> Lines => _lines;
    public IReadOnlyList<object> Events => _events;

    public void AddLine(int productId, int quantity, Money unitPrice)
    {
        if (Status != OrderStatus.Draft) throw new InvalidOperationException("Only draft orders can change.");
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity));
        _lines.Add(new OrderLine(productId, quantity, unitPrice));
    }

    public void Place()
    {
        if (_lines.Count == 0) throw new InvalidOperationException("An order needs at least one line.");
        Status = OrderStatus.Placed;
        _events.Add(new OrderPlaced(Id)); // dispatched after SaveChanges
    }
}
