public static class Tests
{
    [Test("Totals decide the order")]
    public static void T1()
    {
        List<Purchase> p = [new("Ali", 50m), new("Mona", 80m), new("Ali", 40m)];
        Assert.SequenceEqual(new[] { "Ali", "Mona" }, Reports.TopCustomers(p, 2));
    }

    [Test("Takes only the requested count")]
    public static void T2()
    {
        List<Purchase> p = [new("Ali", 50m), new("Mona", 80m), new("Omar", 10m)];
        Assert.SequenceEqual(new[] { "Mona" }, Reports.TopCustomers(p, 1));
    }

    [Test("Ties are ordered by name")]
    public static void T3()
    {
        List<Purchase> p = [new("Zed", 30m), new("Amr", 30m)];
        Assert.SequenceEqual(new[] { "Amr", "Zed" }, Reports.TopCustomers(p, 2));
    }

    [Test("No purchases")]
    public static void T4()
    {
        Assert.Equal(0, Reports.TopCustomers([], 3).Count);
    }
}
