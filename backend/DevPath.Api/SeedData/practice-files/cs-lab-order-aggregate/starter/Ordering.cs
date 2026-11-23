// A value object: equal by value, never negative.
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

// The aggregate root: all changes go through Order so its rules always hold.
public class Order
{
    // Today the lines are a public list anyone can change, and nothing enforces the rules.
    public List<OrderLine> Lines { get; } = [];
    public OrderStatus Status { get; set; }

    public Money Total => Lines.Aggregate(Money.Zero, (sum, line) => sum.Add(line.Total));

    // Rules: quantity must be 1–100; adding an existing SKU increases its quantity (one line per SKU);
    // a submitted order can't change (InvalidOperationException).
    public void AddLine(string sku, int quantity, Money unitPrice) => Lines.Add(new OrderLine(sku, quantity, unitPrice));

    // Rules: an empty order can't be submitted (InvalidOperationException).
    public void Submit() => Status = OrderStatus.Submitted;
}
