public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public decimal Price { get; set; }
}

public record ProductDto(int Id, string Name, decimal Price);
public record ProductQuery(string? Search = null, string? Category = null, decimal? MinPrice = null, decimal? MaxPrice = null, string? Sort = null, int Page = 1, int PageSize = 10);
public record PagedResult<T>(List<T> Items, int Page, int PageSize, int Total);

public static class ProductQueries
{
    public static PagedResult<ProductDto> Search(IQueryable<Product> source, ProductQuery query)
    {
        // TODO: filter, count, sort, page, project
        throw new NotImplementedException();
    }
}
