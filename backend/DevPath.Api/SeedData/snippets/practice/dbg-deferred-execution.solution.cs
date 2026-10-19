var lowStock = products.Where(p => p.Stock < 5).ToList();   // snapshot NOW

foreach (var p in products)
    p.Stock += 20;

Console.WriteLine($"Low stock before restock: {lowStock.Count}");
