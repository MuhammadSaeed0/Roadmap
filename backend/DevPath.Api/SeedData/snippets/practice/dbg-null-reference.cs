public class Order
{
    public int Id { get; set; }
    public decimal Total { get; set; }
    public Coupon Coupon { get; set; } = null!;   // guest orders have no coupon
}

public record Coupon(string Code, decimal Percent);

string Summary(Order order) =>
    $"Order #{order.Id}: {order.Total:C} (coupon {order.Coupon.Code})";   // 💥 for guest orders
