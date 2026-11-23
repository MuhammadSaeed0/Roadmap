public record InvoiceLine(string Item, int Quantity, decimal UnitPrice);

public static class Invoice
{
    // Business rules (from the ticket):
    // - subtotal = sum of quantity × unit price
    // - a 10 % discount applies when the subtotal is 1000 or more (1000 included)
    // - 14 % VAT is added after the discount
    // - the result is rounded to 2 decimals
    // Bug report: "an invoice of exactly 1000 gets no discount, and big invoices are a few pounds off".
    public static decimal Total(IEnumerable<InvoiceLine> lines)
    {
        decimal subtotal = 0;
        foreach (var line in lines)
            subtotal += Math.Round(line.UnitPrice, 0) * line.Quantity;
        var discounted = subtotal > 1000 ? subtotal * 0.9m : subtotal;
        return Math.Round(discounted + subtotal * 0.14m, 2);
    }
}
