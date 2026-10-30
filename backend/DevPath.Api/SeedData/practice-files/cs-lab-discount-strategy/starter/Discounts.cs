public interface IDiscount
{
    decimal Apply(decimal total);
}

// TODO: PercentageDiscount, FixedDiscount and NoDiscount

public static class Checkout
{
    public static decimal Total(decimal subtotal, IDiscount discount) => throw new NotImplementedException();
}
