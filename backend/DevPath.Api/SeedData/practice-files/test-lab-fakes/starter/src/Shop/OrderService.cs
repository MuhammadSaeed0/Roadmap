using Microsoft.Extensions.Logging;

namespace Shop;

public record Order(int ProductId, int Quantity, string CustomerEmail);

public interface IInventory { Task<int> InStockAsync(int productId); }
public interface IOrderRepository { Task<int> SaveAsync(Order order); }
public interface IEmailSender { Task SendAsync(string to, string body); }

public class OrderService(IInventory inventory, IOrderRepository orders, IEmailSender email, ILogger<OrderService> logger)
{
    public async Task<int> PlaceOrder(Order order)
    {
        if (await inventory.InStockAsync(order.ProductId) < order.Quantity)
            throw new InvalidOperationException("Not enough stock.");

        var id = await orders.SaveAsync(order);
        try
        {
            await email.SendAsync(order.CustomerEmail, $"Order {id} confirmed.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Confirmation email for order {OrderId} failed", id);
        }
        return id;
    }
}
