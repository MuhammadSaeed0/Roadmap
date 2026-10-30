var account = new BankAccount();
account.Deposit(100);
account.Withdraw(30);
Console.WriteLine($"Balance: {account.Balance}");
Console.WriteLine(string.Join(" | ", account.History));
