public class OrderStatusRulesTests
{
    [Theory]
    [InlineData(OrderStatus.Draft, OrderStatus.Submitted)]
    [InlineData(OrderStatus.Submitted, OrderStatus.Shipped)]
    [InlineData(OrderStatus.Submitted, OrderStatus.Cancelled)]
    public void Allowed_transitions(OrderStatus from, OrderStatus to) =>
        Assert.True(OrderRules.CanMove(from, to));

    [Theory]
    [InlineData(OrderStatus.Shipped, OrderStatus.Draft)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Submitted)]
    [InlineData(OrderStatus.Delivered, OrderStatus.Cancelled)]
    public void Forbidden_transitions(OrderStatus from, OrderStatus to) =>
        Assert.False(OrderRules.CanMove(from, to));

    [Fact]
    public void Cancellation_window_uses_the_injected_clock()
    {
        var clock = new FakeTimeProvider(new DateTimeOffset(2026, 10, 19, 12, 0, 0, TimeSpan.Zero));
        var order = new Order { CreatedAt = clock.GetUtcNow().UtcDateTime.AddHours(-25) };
        Assert.False(OrderRules.CanCustomerCancel(order, clock));
    }
}
