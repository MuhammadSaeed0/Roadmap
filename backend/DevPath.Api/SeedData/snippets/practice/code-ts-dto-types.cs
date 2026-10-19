// C# contract (JSON uses camelCase and string enums)
public enum OrderStatus { Draft, Submitted, Shipped, Delivered, Cancelled }
public record OrderLineDto(int ProductId, string ProductName, int Quantity, decimal UnitPrice);
public record OrderDto(int Id, DateTime CreatedAt, OrderStatus Status, decimal Total, List<OrderLineDto> Lines);
