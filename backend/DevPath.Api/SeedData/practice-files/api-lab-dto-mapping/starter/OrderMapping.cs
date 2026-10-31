public record OrderLineDto(string Product, int Quantity, decimal LineTotal);
public record OrderDto(int Id, string CustomerName, string Date, List<OrderLineDto> Lines, decimal Total);

public static class OrderMapping
{
    public static OrderDto ToDto(Order order)
    {
        throw new NotImplementedException();
    }
}
