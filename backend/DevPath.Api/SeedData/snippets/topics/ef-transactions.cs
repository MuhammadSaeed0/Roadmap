// Usually enough: one SaveChanges = one transaction
var order = new Order { CustomerId = request.CustomerId };
foreach (var line in request.Lines)
{
    var product = products[line.ProductId];
    product.Stock -= line.Quantity;               // tracked change
    order.Lines.Add(new OrderLine { ProductId = product.Id, Quantity = line.Quantity, UnitPrice = product.Price });
}
db.Orders.Add(order);
await db.SaveChangesAsync(ct);                     // INSERTs + UPDATEs commit together

// Several SaveChanges in one transaction (with retry strategy support)
var strategy = db.Database.CreateExecutionStrategy();
await strategy.ExecuteAsync(async () =>
{
    await using var tx = await db.Database.BeginTransactionAsync(ct);
    await db.SaveChangesAsync(ct);
    await auditService.WriteAsync(order.Id, ct);   // also uses db
    await tx.CommitAsync(ct);                      // rollback happens automatically if not committed
});
