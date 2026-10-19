var lowStock = products.Where(p => p.Stock < 5);

foreach (var p in products)
    p.Stock += 20;                    // restock everything

Console.WriteLine($"Low stock before restock: {lowStock.Count()}");   // prints 0 😕
