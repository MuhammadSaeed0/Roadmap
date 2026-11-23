public record InvoiceLine(string Item, int Quantity, decimal UnitPrice);

public static class Invoice
{
    public static decimal Total(IEnumerable<InvoiceLine> lines)
    {
        var subtotal = lines.Sum(l => l.Quantity * l.UnitPrice);          // no rounding of each price
        var discounted = subtotal >= 1000m ? subtotal * 0.9m : subtotal;   // 1000 is included
        return Math.Round(discounted * 1.14m, 2);                          // VAT on the discounted amount
    }
}
