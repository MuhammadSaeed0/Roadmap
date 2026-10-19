protected override void OnModelCreating(ModelBuilder b)
{
    // Supports: WHERE CustomerId = @id ORDER BY OrderDate DESC
    b.Entity<Order>()
        .HasIndex(o => new { o.CustomerId, o.OrderDate })
        .HasDatabaseName("IX_Orders_CustomerId_OrderDate");

    // Covering index for a list screen (INCLUDE columns)
    b.Entity<Product>()
        .HasIndex(p => p.CategoryId)
        .IncludeProperties(p => new { p.Name, p.Price });

    // Filtered unique index: SKU unique among active products only
    b.Entity<Product>()
        .HasIndex(p => p.Sku)
        .IsUnique()
        .HasFilter("[IsActive] = 1");
}
