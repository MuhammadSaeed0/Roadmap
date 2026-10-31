public static class Tests
{
    [Test("The happy path")]
    public static void Happy()
    {
        var s = OrderWorkflow.Next(OrderState.Pending, OrderAction.Pay);
        s = OrderWorkflow.Next(s, OrderAction.Ship);
        Assert.Equal(OrderState.Delivered, OrderWorkflow.Next(s, OrderAction.Deliver));
    }
    [Test("Pending and paid orders can be cancelled")]
    public static void Cancel() { Assert.Equal(OrderState.Cancelled, OrderWorkflow.Next(OrderState.Pending, OrderAction.Cancel)); Assert.Equal(OrderState.Cancelled, OrderWorkflow.Next(OrderState.Paid, OrderAction.Cancel)); }
    [Test("Shipped orders can't be cancelled")] public static void NoCancel() => Assert.Throws<InvalidOperationException>(() => OrderWorkflow.Next(OrderState.Shipped, OrderAction.Cancel));
    [Test("Can't ship before paying")] public static void NoShip() => Assert.Throws<InvalidOperationException>(() => OrderWorkflow.Next(OrderState.Pending, OrderAction.Ship));
    [Test("Describe uses property patterns")]
    public static void Describe()
    {
        Assert.Equal("Free shipping", OrderWorkflow.Describe(new Order(1, OrderState.Paid, 600)));
        Assert.Equal("Paid", OrderWorkflow.Describe(new Order(2, OrderState.Paid, 100)));
        Assert.Equal("Express", OrderWorkflow.Describe(new Order(3, OrderState.Shipped, 50, IsExpress: true)));
    }
}
