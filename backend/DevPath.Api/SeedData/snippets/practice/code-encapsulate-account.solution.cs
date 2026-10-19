public class BankAccount
{
    private readonly List<string> _history = [];

    public decimal Balance { get; private set; }
    public IReadOnlyList<string> History => _history;

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Deposit must be positive.");
        Balance += amount;
        _history.Add($"+{amount}");
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Withdrawal must be positive.");
        if (amount > Balance) throw new InvalidOperationException("Insufficient funds.");
        Balance -= amount;
        _history.Add($"-{amount}");
    }
}
