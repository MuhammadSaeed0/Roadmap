public interface IShippingCalculator
{
    decimal Calculate(decimal weightKg, decimal orderTotal);
}

// TODO: StandardShipping: 20 + 5 per kg
// TODO: ExpressShipping: 50 + 10 per kg, free when orderTotal > 1000

public class Checkout
{
    // TODO: receive an IShippingCalculator and use it
    public decimal Total(decimal itemsTotal, decimal weightKg) => itemsTotal;
}
