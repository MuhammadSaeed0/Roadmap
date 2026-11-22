// A value object: equal by value, immutable, valid from the start
public sealed record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        if (amount < 0) throw new ArgumentOutOfRangeException(nameof(amount));
        if (currency.Length != 3) throw new ArgumentException("Use an ISO currency code.", nameof(currency));
        (Amount, Currency) = (amount, currency);
    }

    public Money Add(Money other) =>
        other.Currency == Currency ? new Money(Amount + other.Amount, Currency)
                                   : throw new InvalidOperationException("Different currencies.");
}
