public static class Tests
{
    [Test("Deposit and withdraw update the balance")]
    public static void Balance()
    {
        var a = new BankAccount(); a.Deposit(100); a.Withdraw(30);
        Assert.Equal(70m, a.Balance);
    }

    [Test("History records successful operations in order")]
    public static void History()
    {
        var a = new BankAccount(); a.Deposit(100); a.Withdraw(30);
        Assert.SequenceEqual(["Deposit 100", "Withdraw 30"], a.History);
    }

    [Test("Amounts must be positive")]
    public static void Positive()
    {
        var a = new BankAccount();
        Assert.Throws<ArgumentOutOfRangeException>(() => a.Deposit(0));
        Assert.Throws<ArgumentOutOfRangeException>(() => a.Withdraw(-5));
    }

    [Test("Can't withdraw more than the balance, and nothing changes")]
    public static void Overdraft()
    {
        var a = new BankAccount(); a.Deposit(10);
        Assert.Throws<InvalidOperationException>(() => a.Withdraw(11));
        Assert.Equal(10m, a.Balance);
        Assert.Equal(1, a.History.Count);
    }

    [Test("Balance can't be set from outside")]
    public static void Encapsulated()
    {
        var setter = typeof(BankAccount).GetProperty("Balance")!.SetMethod;
        Assert.True(setter is null || !setter.IsPublic, "Balance must not have a public setter");
        Assert.False(typeof(BankAccount).GetProperty("History")!.PropertyType == typeof(List<string>), "History must not expose a List<string>");
    }
}
