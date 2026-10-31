public static class PriceCalculator
{
<<<<<<< HEAD
    public static decimal Total(IEnumerable<(decimal Price, int Quantity)> lines, decimal discount)
    {
        var subtotal = lines.Sum(l => l.Price * l.Quantity);
        return Math.Round(Math.Max(0, subtotal - discount), 2);
    }
=======
    public const decimal VatRate = 0.14m;

    public static decimal Total(IEnumerable<(decimal Price, int Quantity)> lines)
    {
        var subtotal = lines.Sum(l => l.Price * l.Quantity);
        return Math.Round(subtotal * (1 + VatRate), 2);
    }
>>>>>>> main
}
