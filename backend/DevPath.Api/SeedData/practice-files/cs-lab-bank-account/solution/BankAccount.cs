public class BankAccount
{
    private readonly List<string> _history = [];

    public decimal Balance { get; private set; }
    public IReadOnlyList<string> History => _history;

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Deposit a positive amount.");
        Balance += amount;
        _history.Add($"Deposit {amount}");
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Withdraw a positive amount.");
        if (amount > Balance) throw new InvalidOperationException("Not enough money in the account.");
        Balance -= amount;
        _history.Add($"Withdraw {amount}");
    }
}
