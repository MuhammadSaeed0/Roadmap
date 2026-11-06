// Orders service: save the order and publish an integration event in the same transaction (outbox).
public record OrderPlaced(Guid OrderId, IReadOnlyList<OrderLine> Lines);

public sealed class PlaceOrderHandler(OrdersDbContext db, IPublishEndpoint bus)
{
    public async Task<Guid> HandleAsync(PlaceOrder command, CancellationToken ct)
    {
        var order = Order.Create(command.CustomerId, command.Lines);
        db.Orders.Add(order);
        // With MassTransit's EF Core outbox, the message is stored with the order and sent after the commit,
        // so the event is never lost and never sent for an order that wasn't saved.
        await bus.Publish(new OrderPlaced(order.Id, order.Lines), ct);
        await db.SaveChangesAsync(ct);
        return order.Id;
    }
}

// Inventory service (its own database): reserve stock when an order is placed.
public sealed class OrderPlacedConsumer(InventoryDbContext db) : IConsumer<OrderPlaced>
{
    public async Task Consume(ConsumeContext<OrderPlaced> context)
    {
        // Idempotent: a message can arrive twice, so remember which orders were already handled.
        if (await db.ProcessedOrders.AnyAsync(p => p.OrderId == context.Message.OrderId)) return;

        foreach (var line in context.Message.Lines)
            await db.Stock.Where(s => s.ProductId == line.ProductId)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.Reserved, x => x.Reserved + line.Quantity));

        db.ProcessedOrders.Add(new ProcessedOrder(context.Message.OrderId));
        await db.SaveChangesAsync();
    }
}

// Program.cs of each service
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<OrderPlacedConsumer>();
    x.AddEntityFrameworkOutbox<OrdersDbContext>(o => o.UseSqlServer().UseBusOutbox());
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration.GetConnectionString("rabbitmq"));
        cfg.UseMessageRetry(r => r.Exponential(5, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(5)));
        cfg.ConfigureEndpoints(context);
    });
});
// HTTP calls between services get timeouts, retries and a circuit breaker:
builder.Services.AddHttpClient<CatalogClient>(c => c.BaseAddress = new("http://catalog")).AddStandardResilienceHandler();
