using System.Text.RegularExpressions;

public record CreateProductRequest(string Name, decimal Price, int Stock, string Category, string Sku);

public static class RequestValidator
{
    public static readonly string[] Categories = ["Audio", "Input", "Display"];

    public static Dictionary<string, string[]> Validate(CreateProductRequest request)
    {
        // TODO
        return [];
    }
}
