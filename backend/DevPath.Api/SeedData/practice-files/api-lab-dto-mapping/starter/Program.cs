var order = new Order
{
    Id = 7, CreatedAt = new DateTime(2026, 10, 1, 14, 30, 0),
    Customer = new Customer { FirstName = "Sara", LastName = "Ahmed", Email = "sara@example.com", PasswordHash = "secret-hash" },
    Lines = [new() { ProductName = "Mouse", Quantity = 2, UnitPrice = 15.99m }, new() { ProductName = "Keyboard", Quantity = 1, UnitPrice = 49.99m }],
};
Console.WriteLine(OrderMapping.ToDto(order));
