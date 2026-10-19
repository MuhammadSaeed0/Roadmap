public class InventoryDbContext(DbContextOptions<InventoryDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>().Property(p => p.Name).HasMaxLength(100);
    }
}

// Program.cs — registered as Scoped (one instance per HTTP request)
builder.Services.AddDbContext<InventoryDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Inventory")));
