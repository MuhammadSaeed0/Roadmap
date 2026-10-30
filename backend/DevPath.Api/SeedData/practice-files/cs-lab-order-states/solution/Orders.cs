public enum OrderState { Pending, Paid, Shipped, Delivered, Cancelled }
public enum OrderAction { Pay, Ship, Deliver, Cancel }

public record Order(int Id, OrderState State, decimal Total, bool IsExpress = false);

public static class OrderWorkflow
{
    public static OrderState Next(OrderState state, OrderAction action) => (state, action) switch
    {
        (OrderState.Pending, OrderAction.Pay) => OrderState.Paid,
        (OrderState.Paid, OrderAction.Ship) => OrderState.Shipped,
        (OrderState.Shipped, OrderAction.Deliver) => OrderState.Delivered,
        (OrderState.Pending or OrderState.Paid, OrderAction.Cancel) => OrderState.Cancelled,
        _ => throw new InvalidOperationException($"Can't {action} an order that is {state}."),
    };

    public static string Describe(Order order) => order switch
    {
        { State: OrderState.Paid, Total: >= 500 } => "Free shipping",
        { State: OrderState.Shipped, IsExpress: true } => "Express",
        _ => order.State.ToString(),
    };
}
