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
    public const int MaxPageSize = 50;

    public static PagedResult<ProductDto> Search(IQueryable<Product> source, ProductQuery query)
    {
        var q = source;
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(p => p.Name.ToLower().Contains(term));
        }
        if (!string.IsNullOrWhiteSpace(query.Category)) q = q.Where(p => p.Category == query.Category);
        if (query.MinPrice is { } min) q = q.Where(p => p.Price >= min);
        if (query.MaxPrice is { } max) q = q.Where(p => p.Price <= max);

        var total = q.Count();
        q = query.Sort switch
        {
            "price" => q.OrderBy(p => p.Price),
            "-price" => q.OrderByDescending(p => p.Price),
            _ => q.OrderBy(p => p.Name),
        };

        var page = Math.Max(1, query.Page);
        var size = Math.Clamp(query.PageSize, 1, MaxPageSize);
        var items = q.Skip((page - 1) * size).Take(size)
            .Select(p => new ProductDto(p.Id, p.Name, p.Price))
            .ToList();
        return new PagedResult<ProductDto>(items, page, size, total);
    }
}
