public class BankAccount
{
    public decimal Balance { get; set; }          // ❌ anyone can set -1,000,000
    public List<string> History { get; } = [];    // ❌ anyone can Clear() it

    public void Deposit(decimal amount) { Balance += amount; History.Add($"+{amount}"); }
    public void Withdraw(decimal amount) { Balance -= amount; History.Add($"-{amount}"); }
}
