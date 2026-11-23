public record Product(int Id, string Name, int CategoryId, decimal Price, DateTime CreatedAt);

public record ProductFilter(int? CategoryId = null, decimal? MinPrice = null, decimal? MaxPrice = null, string? Q = null);

public static class ProductQuery
{
    public static IQueryable<Product> Apply(IQueryable<Product> products, ProductFilter filter)
    {
        if (filter.CategoryId is { } categoryId) products = products.Where(p => p.CategoryId == categoryId);
        if (filter.MinPrice is { } min) products = products.Where(p => p.Price >= min);
        if (filter.MaxPrice is { } max) products = products.Where(p => p.Price <= max);
        if (!string.IsNullOrWhiteSpace(filter.Q))
        {
            var q = filter.Q.Trim().ToLower();
            products = products.Where(p => p.Name.ToLower().Contains(q));
        }
        return products;
    }
}
