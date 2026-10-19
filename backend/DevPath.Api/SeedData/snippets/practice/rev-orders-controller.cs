[HttpPost("api/orders")]
public IActionResult Create(Order order)                 // binds directly to the entity
{
    foreach (var line in order.Lines)
    {
        var product = db.Products.Find(line.ProductId);   // one query per line
        product.Stock -= line.Quantity;
    }
    order.CreatedAt = DateTime.Now;
    db.Orders.Add(order);                                 // order.Total comes from the browser
    db.SaveChanges();
    return Ok(order);
}
