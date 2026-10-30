public interface IDiscount
{
    decimal Apply(decimal total);
}

public class PercentageDiscount : IDiscount
{
    private readonly decimal _percent;
    public PercentageDiscount(decimal percent)
    {
        if (percent is < 0 or > 100) throw new ArgumentOutOfRangeException(nameof(percent), "Use 0–100.");
        _percent = percent;
    }
    public decimal Apply(decimal total) => total * (100 - _percent) / 100;
}

public class FixedDiscount(decimal amount) : IDiscount
{
    public decimal Apply(decimal total) => total - amount;
}

public class NoDiscount : IDiscount
{
    public decimal Apply(decimal total) => total;
}

public static class Checkout
{
    public static decimal Total(decimal subtotal, IDiscount discount) =>
        Math.Round(Math.Max(0, discount.Apply(subtotal)), 2);
}
