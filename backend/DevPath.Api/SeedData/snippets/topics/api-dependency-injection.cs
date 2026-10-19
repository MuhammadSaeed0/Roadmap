// Program.cs — registration
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddSingleton(TimeProvider.System);

// The container builds the whole graph for you
public class OrderService(AppDbContext db, TimeProvider clock, ILogger<OrderService> logger) : IOrderService
{
    public async Task<int> PlaceAsync(CreateOrderRequest request, CancellationToken ct)
    {
        var order = new Order { CreatedAt = clock.GetUtcNow().UtcDateTime };
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Order {OrderId} placed", order.Id);
        return order.Id;
    }
}

[ApiController, Route("api/orders")]
public class OrdersController(IOrderService orders) : ControllerBase { /* ... */ }
