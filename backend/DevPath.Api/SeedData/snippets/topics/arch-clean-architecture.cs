// Application layer: depends only on Domain and on interfaces it defines.
public interface IOrderRepository
{
    Task AddAsync(Order order, CancellationToken ct);
}

public record PlaceOrder(int CustomerId, IReadOnlyList<OrderLine> Lines);

public sealed class PlaceOrderHandler(IOrderRepository orders, TimeProvider clock)
{
    public async Task<int> HandleAsync(PlaceOrder command, CancellationToken ct)
    {
        var order = Order.Create(command.CustomerId, command.Lines, clock.GetUtcNow()); // rules live in Domain
        await orders.AddAsync(order, ct);
        return order.Id;
    }
}

// Infrastructure layer: implements the interface with EF Core.
public sealed class EfOrderRepository(AppDbContext db) : IOrderRepository
{
    public async Task AddAsync(Order order, CancellationToken ct)
    {
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
    }
}

// Api layer (Program.cs): wire the layers together.
// builder.Services.AddScoped<IOrderRepository, EfOrderRepository>();
// builder.Services.AddScoped<PlaceOrderHandler>();
// app.MapPost("/orders", (PlaceOrder cmd, PlaceOrderHandler h, CancellationToken ct) => h.HandleAsync(cmd, ct));
