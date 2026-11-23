public static class Tests
{
    [Test("The total adds up the lines")]
    public static void Total()
    {
        var order = new Order();
        order.AddLine("MOUSE", 2, new Money(250m));
        order.AddLine("CABLE", 1, new Money(80m));
        Assert.Equal(new Money(580m), order.Total);
    }

    [Test("Adding the same SKU again increases its quantity")]
    public static void OneLinePerSku()
    {
        var order = new Order();
        order.AddLine("MOUSE", 2, new Money(250m));
        order.AddLine("MOUSE", 3, new Money(250m));
        Assert.Equal(1, order.Lines.Count);
        Assert.Equal(5, order.Lines[0].Quantity);
    }

    [Test("Quantities outside 1–100 are rejected")]
    public static void Quantity()
    {
        var order = new Order();
        Assert.Throws<ArgumentOutOfRangeException>(() => order.AddLine("MOUSE", 0, new Money(1m)));
        order.AddLine("MOUSE", 60, new Money(1m));
        Assert.Throws<ArgumentOutOfRangeException>(() => order.AddLine("MOUSE", 41, new Money(1m)));
    }

    [Test("An empty order can't be submitted, and a submitted one can't change")]
    public static void Lifecycle()
    {
        var order = new Order();
        Assert.Throws<InvalidOperationException>(() => order.Submit());
        order.AddLine("MOUSE", 1, new Money(250m));
        order.Submit();
        Assert.Equal(OrderStatus.Submitted, order.Status);
        Assert.Throws<InvalidOperationException>(() => order.AddLine("CABLE", 1, new Money(80m)));
    }

    [Test("Outside code can't change the lines or the status directly")]
    public static void Encapsulation()
    {
        Assert.False(typeof(Order).GetProperty("Lines")!.PropertyType.Name.StartsWith("List"), "expose the lines as read-only");
        Assert.False(typeof(Order).GetProperty("Status")!.SetMethod?.IsPublic ?? false, "the status setter must not be public");
    }
}
