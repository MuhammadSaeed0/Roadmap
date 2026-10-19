public static class OrderRules
{
    public static bool CanMove(OrderStatus from, OrderStatus to) => (from, to) switch
    {
        (OrderStatus.Draft, OrderStatus.Submitted) => true,
        (OrderStatus.Submitted, OrderStatus.Shipped or OrderStatus.Cancelled) => true,
        (OrderStatus.Shipped, OrderStatus.Delivered) => true,
        _ => false
    };

    public static IReadOnlyList<OrderStatus> AllowedNext(OrderStatus from) =>
        Enum.GetValues<OrderStatus>().Where(to => CanMove(from, to)).ToList();
}
