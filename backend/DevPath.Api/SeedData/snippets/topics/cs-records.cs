public record ProductDto(int Id, string Name, decimal Price);

var a = new ProductDto(1, "Mouse", 25m);
var b = new ProductDto(1, "Mouse", 25m);
Console.WriteLine(a == b);              // True — value equality

var discounted = a with { Price = 20m }; // non-destructive copy
Console.WriteLine(a.Price);              // 25 — original unchanged

public record Money(decimal Amount, string Currency)
{
    public Money Add(Money other) =>
        Currency == other.Currency ? this with { Amount = Amount + other.Amount }
                                   : throw new InvalidOperationException("Currency mismatch");
}
