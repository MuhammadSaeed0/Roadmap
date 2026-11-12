List<Purchase> purchases = [new("Ali", 50m), new("Mona", 80m), new("Ali", 40m)];
Console.WriteLine(string.Join(", ", Reports.TopCustomers(purchases, 2)));
