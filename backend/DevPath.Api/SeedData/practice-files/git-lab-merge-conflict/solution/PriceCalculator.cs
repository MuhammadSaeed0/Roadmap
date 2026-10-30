public static class PriceCalculator
{
    public const decimal VatRate = 0.14m;

    public static decimal Total(IEnumerable<(decimal Price, int Quantity)> lines, decimal discount = 0)
    {
        var subtotal = lines.Sum(l => l.Price * l.Quantity);
        var discounted = Math.Max(0, subtotal - discount);
        return Math.Round(discounted * (1 + VatRate), 2);
    }
}
