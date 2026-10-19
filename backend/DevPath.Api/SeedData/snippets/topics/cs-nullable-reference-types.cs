public class Customer(string email)
{
    public string Email { get; } = email;       // never null
    public string? MiddleName { get; set; }     // optional
}

Customer? FindCustomer(int id) => customers.FirstOrDefault(c => c.Id == id);

var customer = FindCustomer(42);
if (customer is null)
{
    Console.WriteLine("Not found");
    return;
}
// The compiler knows customer is not null here
Console.WriteLine(customer.Email.ToUpper());
Console.WriteLine(customer.MiddleName?.ToUpper() ?? "(no middle name)");
