public class BankAccount
{
    public decimal Balance { get; private set; }

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be positive.", nameof(amount));
        Balance += amount;
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be positive.", nameof(amount));
        if (amount > Balance) throw new InvalidOperationException("Not enough balance.");
        Balance -= amount;
    }
}
