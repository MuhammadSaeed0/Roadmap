// EF Core for business operations (testable C# rules)
order.Submit();                       // validates state transitions
await db.SaveChangesAsync(ct);

// Stored procedure for a heavy report, still parameterised
var rows = await db.Database
    .SqlQuery<SalesByRegionRow>($"EXEC dbo.usp_SalesByRegion @From = {from}, @To = {to}")
    .ToListAsync(ct);

// Set-based maintenance without loading entities
await db.Database.ExecuteSqlAsync($"EXEC dbo.usp_ArchiveOrders @Before = {cutoff}", ct);

public record SalesByRegionRow(string Region, int Orders, decimal Revenue);
