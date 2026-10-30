// The same query in SQL (you will learn it in phase 5):
//      SELECT c.Name AS Category, MONTH(o.Date) AS Month, SUM(l.Qty * l.Price) AS Total
//      ... GROUP BY c.Name, MONTH(o.Date)
var monthly = orders
    .SelectMany(o => o.Lines, (o, l) => new { o.Date, l.Product.Category, Amount = l.Quantity * l.UnitPrice })
    .GroupBy(x => new { x.Category, x.Date.Month })
    .Select(g => new { g.Key.Category, g.Key.Month, Total = g.Sum(x => x.Amount) })
    .OrderBy(x => x.Month).ThenBy(x => x.Category)
    .ToList();

// Top customer per city (like ROW_NUMBER() OVER (PARTITION BY City ORDER BY Spend DESC) = 1)
var topPerCity = customers
    .GroupBy(c => c.City)
    .Select(g => g.OrderByDescending(c => c.TotalSpend).First())
    .ToList();

var join = orders.Join(customers, o => o.CustomerId, c => c.Id, (o, c) => new { o.Id, c.Name });
