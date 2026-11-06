// RabbitMQ.Client 7: a topic exchange, a durable queue with a dead-letter exchange, manual acks.
await using var connection = await new ConnectionFactory { HostName = "localhost" }.CreateConnectionAsync();
await using var channel = await connection.CreateChannelAsync();

await channel.ExchangeDeclareAsync("orders", ExchangeType.Topic, durable: true);
await channel.ExchangeDeclareAsync("orders.dlx", ExchangeType.Fanout, durable: true);
await channel.QueueDeclareAsync("inventory.order-placed", durable: true, exclusive: false, autoDelete: false,
    arguments: new Dictionary<string, object?> { ["x-dead-letter-exchange"] = "orders.dlx" });
await channel.QueueBindAsync("inventory.order-placed", "orders", routingKey: "order.placed");
await channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 10, global: false);

var consumer = new AsyncEventingBasicConsumer(channel);
consumer.ReceivedAsync += async (_, ea) =>
{
    try
    {
        var message = JsonSerializer.Deserialize<OrderPlaced>(ea.Body.Span)!;
        await inventory.ReserveOnceAsync(ea.BasicProperties.MessageId, message); // idempotent
        await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);
    }
    catch (Exception)
    {
        // requeue: false sends the message to the dead-letter exchange
        await channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: false);
    }
};
await channel.BasicConsumeAsync("inventory.order-placed", autoAck: false, consumer);
