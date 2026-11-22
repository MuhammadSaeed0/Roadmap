public interface IDiscount { string Code { get; } decimal Apply(decimal total); }

public sealed class NoDiscount : IDiscount { public string Code => "none"; public decimal Apply(decimal t) => t; }
public sealed class StudentDiscount : IDiscount { public string Code => "student"; public decimal Apply(decimal t) => t * 0.8m; }

// Program.cs: builder.Services.AddSingleton<IDiscount, NoDiscount>();
//             builder.Services.AddSingleton<IDiscount, StudentDiscount>();
public sealed class Checkout(IEnumerable<IDiscount> discounts)
{
    public decimal Total(decimal amount, string code) =>
        (discounts.FirstOrDefault(d => d.Code == code) ?? new NoDiscount()).Apply(amount);
}
