// Func<in, out>, Action<in>, Predicate<in>
Func<decimal, decimal> addVat = price => price * 1.14m;
Action<string> log = message => Console.WriteLine($"[LOG] {message}");
Predicate<Product> isLow = p => p.Stock < 5;

static List<Product> Filter(IEnumerable<Product> source, Func<Product, bool> rule)
{
    var result = new List<Product>();
    foreach (var p in source)
        if (rule(p)) result.Add(p);
    return result;
}

var lowStock = Filter(products, p => p.Stock < 5);
log($"{lowStock.Count} products are low on stock");
