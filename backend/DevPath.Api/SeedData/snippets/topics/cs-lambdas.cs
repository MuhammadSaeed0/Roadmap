var minTotal = 500m;

// Lambda capturing a local variable (closure)
var bigOrders = orders.Where(o => o.Total > minTotal).ToList();

// Multi-line lambda body
Func<Order, string> describe = o =>
{
    var status = o.IsPaid ? "paid" : "unpaid";
    return $"#{o.Id} {o.Total:C} ({status})";
};

products.Sort((a, b) => a.Price.CompareTo(b.Price));
