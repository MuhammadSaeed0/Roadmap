// Before: one class with many reasons to change
public class OrderManager
{
    public void Place(Order order)
    {
        // validate, save to database, send email, write log ...
    }
}

// After: focused classes, dependencies injected (S + D)
public class OrderService(IOrderValidator validator, AppDbContext db, IEmailSender email)
{
    public async Task PlaceAsync(Order order)
    {
        validator.EnsureValid(order);
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        await email.SendAsync(order.CustomerEmail, "Order received", $"Order #{order.Id}");
    }
}
