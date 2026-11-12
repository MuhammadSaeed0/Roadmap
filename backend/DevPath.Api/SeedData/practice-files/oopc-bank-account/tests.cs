public static class Tests
{
    [Test("Deposit and withdraw")]
    public static void T1()
    {
        var a = new BankAccount();
        a.Deposit(100m);
        a.Withdraw(30m);
        Assert.Equal(70m, a.Balance);
    }

    [Test("Rejects amounts that are not positive")]
    public static void T2()
    {
        var a = new BankAccount();
        Assert.Throws<ArgumentException>(() => a.Deposit(0m));
        Assert.Throws<ArgumentException>(() => a.Withdraw(-5m));
    }

    [Test("Cannot overdraw, and the balance stays")]
    public static void T3()
    {
        var a = new BankAccount();
        a.Deposit(50m);
        Assert.Throws<InvalidOperationException>(() => a.Withdraw(80m));
        Assert.Equal(50m, a.Balance);
    }

    [Test("Balance cannot be set from outside")]
    public static void T4()
    {
        var setter = typeof(BankAccount).GetProperty("Balance")!.SetMethod;
        Assert.True(setter is null || !setter.IsPublic, "make the setter of Balance private");
    }
}
