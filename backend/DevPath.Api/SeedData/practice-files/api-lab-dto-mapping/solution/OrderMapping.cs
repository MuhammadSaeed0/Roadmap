public record OrderLineDto(string Product, int Quantity, decimal LineTotal);
public record OrderDto(int Id, string CustomerName, string Date, List<OrderLineDto> Lines, decimal Total);

public static class OrderMapping
{
    public static OrderDto ToDto(Order order)
    {
        var lines = order.Lines
            .Select(l => new OrderLineDto(l.ProductName, l.Quantity, l.UnitPrice * l.Quantity))
            .ToList();
        return new OrderDto(
            order.Id,
            $"{order.Customer.FirstName} {order.Customer.LastName}",
            order.CreatedAt.ToString("yyyy-MM-dd"),
            lines,
            lines.Sum(l => l.LineTotal));
    }
}
