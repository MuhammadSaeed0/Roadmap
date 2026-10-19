public enum OrderStatus { Draft, Submitted, Shipped, Delivered, Cancelled }

public static class OrderRules
{
    public static bool CanMove(OrderStatus from, OrderStatus to)
    {
        // TODO
        throw new NotImplementedException();
    }

    public static IReadOnlyList<OrderStatus> AllowedNext(OrderStatus from)
    {
        // TODO
        throw new NotImplementedException();
    }
}
