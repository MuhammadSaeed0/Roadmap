static decimal CalculateSubtotal(IEnumerable<OrderLine> lines)
{
    decimal subtotal = 0;
    foreach (var line in lines) subtotal += line.Quantity * line.UnitPrice;
    return subtotal;
}

static decimal CalculateTotal(IEnumerable<OrderLine> lines, decimal taxRate = 0.14m)
{
    var subtotal = CalculateSubtotal(lines);
    return subtotal + subtotal * taxRate;
}

static bool IsAdult(int age) => age >= 18;   // expression-bodied

var total = CalculateTotal(lines, taxRate: 0.10m);   // named argument
