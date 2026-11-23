public record Product(int Id, string Name, int CategoryId, decimal Price, DateTime CreatedAt);

// Every filter is optional: null means "not supplied".
public record ProductFilter(int? CategoryId = null, decimal? MinPrice = null, decimal? MaxPrice = null, string? Q = null);

public static class ProductQuery
{
    // Adds a Where clause only for the filters that were supplied (the query stays an IQueryable, so EF Core
    // would translate it to one SQL statement). Q matches part of the name, ignoring case; blank Q is ignored.
    public static IQueryable<Product> Apply(IQueryable<Product> products, ProductFilter filter)
    {
        return products.Where(p => p.CategoryId == filter.CategoryId
                                && p.Price >= filter.MinPrice
                                && p.Price <= filter.MaxPrice
                                && p.Name.Contains(filter.Q!));
    }
}
