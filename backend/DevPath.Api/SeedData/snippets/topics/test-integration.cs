public class PlaceOrderTests : IDisposable
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");
    private readonly AppDbContext _db;

    public PlaceOrderTests()
    {
        _connection.Open();   // the in-memory database lives as long as the connection
        _db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options);
        _db.Database.EnsureCreated();
        _db.Products.Add(new Product { Id = 1, Name = "Mouse", Price = 20m, Stock = 5 });
        _db.SaveChanges();
    }

    [Fact]
    public async Task Placing_an_order_reduces_stock()
    {
        var service = new OrderService(_db, TimeProvider.System);
        await service.PlaceAsync(new PlaceOrderRequest(CustomerId: 1, [new(ProductId: 1, Quantity: 2)]), default);

        Assert.Equal(3, (await _db.Products.FindAsync(1))!.Stock);
        Assert.Equal(1, await _db.Orders.CountAsync());
    }

    public void Dispose() { _db.Dispose(); _connection.Dispose(); }
}
