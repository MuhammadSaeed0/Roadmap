// A hand-written fake is often simpler than a mocking library
public class FakeEmailSender : IEmailSender
{
    public List<(string To, string Subject)> Sent { get; } = [];

    public Task SendAsync(string to, string subject, string body)
    {
        Sent.Add((to, subject));
        return Task.CompletedTask;
    }
}

[Fact]
public async Task Placing_an_order_sends_one_confirmation()
{
    var email = new FakeEmailSender();
    var service = new OrderService(TestDb.Create(), email, TimeProvider.System);

    await service.PlaceAsync(SampleOrders.Valid(), default);

    var sent = Assert.Single(email.Sent);
    Assert.Equal("Order received", sent.Subject);
}
