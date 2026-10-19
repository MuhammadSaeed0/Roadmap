public async Task<int> PlaceOrderAsync(PlaceOrderRequest request, CancellationToken ct)
{
    // 1) Validate and load OUTSIDE the transaction
    var products = await LoadAndValidateAsync(request, ct);

    // 2) Short transaction: only the writes
    var order = BuildOrder(request, products);
    db.Orders.Add(order);
    await db.SaveChangesAsync(ct);          // implicit transaction, commits immediately

    // 3) Slow external work AFTER commit — never inside the transaction
    await emailSender.SendAsync(request.Email, "Order received", $"#{order.Id}");
    return order.Id;
}
