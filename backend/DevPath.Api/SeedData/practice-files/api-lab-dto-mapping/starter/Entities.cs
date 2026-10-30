public class Customer
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
}

public class OrderLine
{
    public string ProductName { get; set; } = "";
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class Order
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public Customer Customer { get; set; } = new();
    public List<OrderLine> Lines { get; set; } = [];
}
