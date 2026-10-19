public class Product
{
    public int Id { get; set; }                 // primary key by convention
    public string Name { get; set; } = "";
    public string Sku { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

protected override void OnModelCreating(ModelBuilder b)
{
    b.Entity<Product>(e =>
    {
        e.Property(p => p.Name).HasMaxLength(100).IsRequired();   // nvarchar(100) NOT NULL
        e.Property(p => p.Sku).HasMaxLength(20);
        e.HasIndex(p => p.Sku).IsUnique();                         // UNIQUE index
        e.Property(p => p.Price).HasPrecision(18, 2);              // decimal(18,2)
        e.ToTable(t => t.HasCheckConstraint("CK_Product_Stock", "Stock >= 0"));
    });
}
