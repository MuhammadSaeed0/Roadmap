// Before: one long method that mixes validation, calculation and persistence
public async Task<int> Place(PlaceOrderRequest r)
{
    if (r.Lines.Count == 0) throw new ValidationException("Empty order");
    decimal total = 0;
    foreach (var l in r.Lines) { var p = await db.Products.FindAsync(l.ProductId); total += p!.Price * l.Quantity; }
    // ... 60 more lines ...
}

// After: small steps, each committed separately, behaviour unchanged (tests stay green)
public async Task<int> PlaceAsync(PlaceOrderRequest request, CancellationToken ct)
{
    OrderValidator.EnsureNotEmpty(request);
    var products = await LoadProductsAsync(request, ct);
    var order = OrderFactory.Create(request, products);   // total calculated here, from DB prices
    return await SaveAsync(order, ct);
}
