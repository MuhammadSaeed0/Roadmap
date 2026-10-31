using Microsoft.EntityFrameworkCore;

public class Customer { public int Id { get; set; } public string Name { get; set; } = ""; }
public class OrderLine { public int Id { get; set; } public int OrderId { get; set; } public int Quantity { get; set; } public decimal UnitPrice { get; set; } }
public class Order
{
    public int Id { get; set; }
    public string Status { get; set; } = "";
    public int CustomerId { get; set; }
    public virtual Customer Customer { get; set; } = null!;
    public virtual List<OrderLine> Lines { get; set; } = [];
}

public class ShopContext(DbContextOptions<ShopContext> options) : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();
}
