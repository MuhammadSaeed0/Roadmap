public record Product(int Id, string Name, int CategoryId, decimal Price, DateTime CreatedAt);

public static class ProductSorting
{
    // Sorts by an allow-listed field: "name", "price" or "created" (case-insensitive), ascending or descending.
    // No sortBy (null or blank) sorts by Id. Any other field throws ArgumentException (the API turns it into a 400).
    // Ties are always broken by Id ascending, so paging is stable.
    public static IQueryable<Product> Apply(IQueryable<Product> products, string? sortBy, bool desc)
    {
        throw new NotImplementedException();
    }
}
