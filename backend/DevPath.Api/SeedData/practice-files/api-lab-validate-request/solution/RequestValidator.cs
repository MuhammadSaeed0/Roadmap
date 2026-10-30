using System.Text.RegularExpressions;

public record CreateProductRequest(string Name, decimal Price, int Stock, string Category, string Sku);

public static class RequestValidator
{
    public static readonly string[] Categories = ["Audio", "Input", "Display"];

    public static Dictionary<string, string[]> Validate(CreateProductRequest request)
    {
        var errors = new Dictionary<string, List<string>>();
        void Add(string field, string message)
        {
            if (!errors.TryGetValue(field, out var list)) errors[field] = list = [];
            list.Add(message);
        }

        if (string.IsNullOrWhiteSpace(request.Name)) Add(nameof(request.Name), "Name is required.");
        else if (request.Name.Length > 100) Add(nameof(request.Name), "Name must be at most 100 characters.");
        if (request.Price <= 0) Add(nameof(request.Price), "Price must be greater than 0.");
        if (request.Stock < 0) Add(nameof(request.Stock), "Stock can't be negative.");
        if (!Categories.Contains(request.Category)) Add(nameof(request.Category), $"Category must be one of: {string.Join(", ", Categories)}.");
        if (request.Sku is null || !Regex.IsMatch(request.Sku, @"^[A-Z]{3}-\d{4}$")) Add(nameof(request.Sku), "SKU must look like ABC-1234.");

        return errors.ToDictionary(e => e.Key, e => e.Value.ToArray());
    }
}
