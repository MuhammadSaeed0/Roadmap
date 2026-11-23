using System.Linq.Expressions;

public record Product(int Id, string Name, int CategoryId, decimal Price, DateTime CreatedAt);

public static class ProductSorting
{
    private static readonly Dictionary<string, Expression<Func<Product, object>>> Fields = new(StringComparer.OrdinalIgnoreCase)
    {
        ["name"] = p => p.Name,
        ["price"] = p => p.Price,
        ["created"] = p => p.CreatedAt,
    };

    public static IQueryable<Product> Apply(IQueryable<Product> products, string? sortBy, bool desc)
    {
        if (string.IsNullOrWhiteSpace(sortBy)) return products.OrderBy(p => p.Id);
        if (!Fields.TryGetValue(sortBy.Trim(), out var key))
            throw new ArgumentException($"Cannot sort by '{sortBy}'. Use name, price or created.", nameof(sortBy));
        var sorted = desc ? products.OrderByDescending(key) : products.OrderBy(key);
        return sorted.ThenBy(p => p.Id);
    }
}
