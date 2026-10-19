public enum OrderStatus { Draft, Submitted, Shipped, Delivered, Cancelled }

public static bool CanMove(OrderStatus from, OrderStatus to) => (from, to) switch
{
    (OrderStatus.Draft, OrderStatus.Submitted) => true,
    (OrderStatus.Submitted, OrderStatus.Shipped or OrderStatus.Cancelled) => true,
    (OrderStatus.Shipped, OrderStatus.Delivered) => true,
    _ => false
};

decimal Shipping(Order order) => order switch
{
    { IsVip: true } => 0m,
    { Country: "EG", Weight: <= 5 } => 30m,
    { Country: "EG" } => 60m,
    { Weight: > 20 } => 400m,
    _ => 150m
};

if (shape is Circle { Radius: > 10 } big)
    Console.WriteLine($"Big circle: {big.Radius}");
