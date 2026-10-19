[HttpGet("{id:int}")]
public async Task<ActionResult<ProductDto>> Get(int id, CancellationToken ct)
{
    var product = await db.Products.AsNoTracking()
        .Where(p => p.Id == id)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price))
        .FirstOrDefaultAsync(ct);

    return product is null ? NotFound() : product;   // 404 vs 200
}
