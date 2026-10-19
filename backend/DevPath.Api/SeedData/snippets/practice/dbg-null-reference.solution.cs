public class Order
{
    public int Id { get; set; }
    public decimal Total { get; set; }
    public Coupon? Coupon { get; set; }           // the type now tells the truth
}

string Summary(Order order) =>
    $"Order #{order.Id}: {order.Total:C} ({order.Coupon?.Code ?? "No coupon"})";
