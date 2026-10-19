[HttpGet("api/products/search")]
public Task<List<ProductDto>> Search(string term, string? sortBy, CancellationToken ct)
{
    var pattern = SearchService.LikePattern(term);                  // escapes %, _ and [
    var query = db.Products.AsNoTracking().Where(p => EF.Functions.Like(p.Name, pattern));

    query = sortBy switch                                           // allow-list
    {
        "price" => query.OrderBy(p => p.Price).ThenBy(p => p.Id),
        _       => query.OrderBy(p => p.Name).ThenBy(p => p.Id)
    };

    return query.Take(50).Select(p => new ProductDto(p.Id, p.Name, p.Price)).ToListAsync(ct);
}
