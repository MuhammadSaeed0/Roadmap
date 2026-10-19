public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Product> Products { get; set; } = [];
}

public class Product
{
    public int Id { get; set; }
    public int CategoryId { get; set; }            // foreign key
    public Category Category { get; set; } = null!; // navigation
    public List<ProductSupplier> Suppliers { get; set; } = [];
}

// Explicit join entity for many-to-many with extra data
public class ProductSupplier
{
    public int ProductId { get; set; }
    public int SupplierId { get; set; }
    public decimal SupplierPrice { get; set; }
}

b.Entity<Product>()
    .HasOne(p => p.Category).WithMany(c => c.Products)
    .HasForeignKey(p => p.CategoryId)
    .OnDelete(DeleteBehavior.Restrict);           // can't delete a category in use

b.Entity<ProductSupplier>().HasKey(x => new { x.ProductId, x.SupplierId });
