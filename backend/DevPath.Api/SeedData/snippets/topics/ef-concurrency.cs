public class Order
{
    public int Id { get; set; }
    public OrderStatus Status { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];   // SQL Server rowversion
}

public async Task UpdateStatusAsync(int id, UpdateStatusRequest request, CancellationToken ct)
{
    var order = await db.Orders.FindAsync([id], ct) ?? throw new NotFoundException("Order", id);

    // Tell EF which version the client saw
    db.Entry(order).Property(o => o.RowVersion).OriginalValue = request.RowVersion;
    order.Status = request.Status;

    try
    {
        await db.SaveChangesAsync(ct);   // UPDATE ... WHERE Id = @id AND RowVersion = @original
    }
    catch (DbUpdateConcurrencyException)
    {
        throw new BusinessRuleException("concurrency_conflict", "The order was changed by someone else.");
    }
}
