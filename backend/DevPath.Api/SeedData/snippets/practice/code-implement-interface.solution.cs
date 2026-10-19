public class StandardShipping : IShippingCalculator
{
    public decimal Calculate(decimal weightKg, decimal orderTotal) => 20m + 5m * weightKg;
}

public class ExpressShipping : IShippingCalculator
{
    public decimal Calculate(decimal weightKg, decimal orderTotal) =>
        orderTotal > 1000m ? 0m : 50m + 10m * weightKg;
}

public class Checkout(IShippingCalculator shipping)
{
    public decimal Total(decimal itemsTotal, decimal weightKg) =>
        itemsTotal + shipping.Calculate(weightKg, itemsTotal);
}

var total = new Checkout(new ExpressShipping()).Total(1200m, 3m);   // 1200
