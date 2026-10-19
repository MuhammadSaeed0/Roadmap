// Is RCSI on? (readers don't block writers when it is)
// SELECT name, is_read_committed_snapshot_on FROM sys.databases WHERE name = DB_NAME();

var strategy = db.Database.CreateExecutionStrategy();
await strategy.ExecuteAsync(async () =>
{
    await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

    var last = await db.Invoices.MaxAsync(i => (int?)i.Number, ct) ?? 0;
    db.Invoices.Add(new Invoice { Number = last + 1 });
    await db.SaveChangesAsync(ct);

    await tx.CommitAsync(ct);
});

// Better design: let SQL Server generate numbers
// modelBuilder.HasSequence<int>("InvoiceNumbers");
// modelBuilder.Entity<Invoice>().Property(i => i.Number).HasDefaultValueSql("NEXT VALUE FOR InvoiceNumbers");
