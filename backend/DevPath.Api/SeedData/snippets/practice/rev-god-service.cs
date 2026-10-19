public class OrderManager
{
    public void PlaceOrder(OrderForm form)
    {
        if (form.Lines.Count == 0) throw new Exception("empty");
        using var db = new AppDbContext();                    // created here
        decimal total = 0;
        foreach (var l in form.Lines)
        {
            var p = db.Products.Find(l.ProductId);
            total += p!.Price * l.Quantity * (DateTime.Now.DayOfWeek == DayOfWeek.Friday ? 0.9m : 1m);
        }
        var order = new Order { Total = total, CreatedAt = DateTime.Now };
        db.Orders.Add(order);
        db.SaveChanges();
        new SmtpClient("smtp.company.local").Send("shop@x.com", form.Email, "Thanks", $"Total {total}");
        File.AppendAllText(@"C:\logs\orders.txt", $"{order.Id};{total}\n");
    }
    // ... 1,400 more lines: refunds, reports, CSV export, coupons ...
}
