public enum OrderState { Pending, Paid, Shipped, Delivered, Cancelled }
public enum OrderAction { Pay, Ship, Deliver, Cancel }

public record Order(int Id, OrderState State, decimal Total, bool IsExpress = false);

public static class OrderWorkflow
{
    public static OrderState Next(OrderState state, OrderAction action) => throw new NotImplementedException();

    public static string Describe(Order order) => throw new NotImplementedException();
}
