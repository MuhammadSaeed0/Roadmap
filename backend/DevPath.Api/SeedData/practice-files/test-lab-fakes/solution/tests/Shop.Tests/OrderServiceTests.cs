using Microsoft.Extensions.Logging.Abstractions;
using Shop;
using Xunit;

public class OrderServiceTests
{
    private sealed class FakeInventory(int stock) : IInventory
    {
        public Task<int> InStockAsync(int productId) => Task.FromResult(stock);
    }

    private sealed class FakeRepository : IOrderRepository
    {
        public List<Order> Saved { get; } = [];
        public Task<int> SaveAsync(Order order) { Saved.Add(order); return Task.FromResult(Saved.Count); }
    }

    private sealed class FakeEmail : IEmailSender
    {
        public bool Fail { get; init; }
        public List<string> Sent { get; } = [];
        public Task SendAsync(string to, string body)
        {
            if (Fail) throw new InvalidOperationException("SMTP down");
            Sent.Add(to);
            return Task.CompletedTask;
        }
    }

    private static OrderService Create(int stock, FakeRepository repo, FakeEmail email) =>
        new(new FakeInventory(stock), repo, email, NullLogger<OrderService>.Instance);

    [Fact]
    public async Task A_valid_order_is_saved_once_and_confirmed_by_email()
    {
        var repo = new FakeRepository(); var email = new FakeEmail();
        var id = await Create(stock: 5, repo, email).PlaceOrder(new Order(1, 2, "sara@example.com"));
        Assert.Equal(1, id);
        Assert.Single(repo.Saved);
        Assert.Equal(new[] { "sara@example.com" }, email.Sent);
    }

    [Fact]
    public async Task Out_of_stock_throws_and_saves_nothing()
    {
        var repo = new FakeRepository(); var email = new FakeEmail();
        await Assert.ThrowsAsync<InvalidOperationException>(() => Create(stock: 1, repo, email).PlaceOrder(new Order(1, 2, "sara@example.com")));
        Assert.Empty(repo.Saved);
        Assert.Empty(email.Sent);
    }

    [Fact]
    public async Task A_failed_email_does_not_lose_the_order()
    {
        var repo = new FakeRepository();
        var id = await Create(stock: 5, repo, new FakeEmail { Fail = true }).PlaceOrder(new Order(1, 1, "sara@example.com"));
        Assert.Equal(1, id);
        Assert.Single(repo.Saved);
    }
}
