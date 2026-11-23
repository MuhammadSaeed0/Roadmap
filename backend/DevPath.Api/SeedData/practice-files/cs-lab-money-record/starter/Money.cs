// TODO: turn Money into a positional record and implement Add.
public class Money
{
    public Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public decimal Amount { get; set; }
    public string Currency { get; set; }

    // Adds two amounts of the same currency; different currencies throw InvalidOperationException.
    public Money Add(Money other) => throw new NotImplementedException();
}

// TODO: a positional record Product(string Name, Money Price).
public class Product
{
    public Product(string name, Money price) { Name = name; Price = price; }
    public string Name { get; set; }
    public Money Price { get; set; }
}
