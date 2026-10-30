var products = new List<Product>
{
    new() { Id = 1, Name = "Mouse", Category = "Input", Price = 15.99m },
    new() { Id = 2, Name = "Monitor", Category = "Display", Price = 249m },
    new() { Id = 3, Name = "Keyboard", Category = "Input", Price = 49.99m },
    new() { Id = 4, Name = "Mousepad", Category = "Input", Price = 9.50m },
    new() { Id = 5, Name = "Headset", Category = "Audio", Price = 79m },
}.AsQueryable();

var page = ProductQueries.Search(products, new ProductQuery(Search: "mo", Sort: "-price", PageSize: 2));
Console.WriteLine($"Total {page.Total}: {string.Join(", ", page.Items.Select(p => p.Name))}");
