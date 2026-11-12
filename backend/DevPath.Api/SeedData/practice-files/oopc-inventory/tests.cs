public static class Tests
{
    [Test("Add and remove, ignoring case")]
    public static void T1()
    {
        var i = new Inventory();
        i.Add("Pen", 10);
        i.Remove("pen", 4);
        Assert.Equal(6, i.QuantityOf("PEN"));
    }

    [Test("Unknown product has no stock")]
    public static void T2()
    {
        Assert.Equal(0, new Inventory().QuantityOf("Ghost"));
    }

    [Test("Cannot remove more than the stock")]
    public static void T3()
    {
        var i = new Inventory();
        i.Add("Pen", 2);
        Assert.Throws<InvalidOperationException>(() => i.Remove("Pen", 3));
        Assert.Throws<InvalidOperationException>(() => i.Remove("Ghost", 1));
        Assert.Equal(2, i.QuantityOf("Pen"));
    }

    [Test("Rejects quantities that are not positive")]
    public static void T4()
    {
        var i = new Inventory();
        Assert.Throws<ArgumentException>(() => i.Add("Pen", 0));
        Assert.Throws<ArgumentException>(() => i.Remove("Pen", -1));
    }

    [Test("Low stock is sorted")]
    public static void T5()
    {
        var i = new Inventory();
        i.Add("Ruler", 1); i.Add("Desk", 50); i.Add("Clip", 3);
        Assert.SequenceEqual(new[] { "Clip", "Ruler" }, i.LowStock(5));
    }
}
