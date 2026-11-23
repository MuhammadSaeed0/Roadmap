public record Money(decimal Amount, string Currency)
{
    public Money Add(Money other)
    {
        if (other.Currency != Currency)
            throw new InvalidOperationException($"Cannot add {other.Currency} to {Currency}.");
        return this with { Amount = Amount + other.Amount };
    }
}

public record Product(string Name, Money Price);
