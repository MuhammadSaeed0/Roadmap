public class Order
{
    public int Id { get; set; }
    public OrderStatus Status { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];
}

// UPDATE [Orders] SET [Status] = @p0
// WHERE [Id] = @p1 AND [RowVersion] = @p2;   ← 0 rows → DbUpdateConcurrencyException
