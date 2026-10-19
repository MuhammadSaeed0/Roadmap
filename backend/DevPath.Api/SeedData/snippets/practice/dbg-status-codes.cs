[HttpGet("{id:int}")]
public async Task<IActionResult> Get(int id, CancellationToken ct)
{
    var product = await db.Products.AsNoTracking()
        .Where(p => p.Id == id)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price))
        .FirstOrDefaultAsync(ct);

    return Ok(product);   // product can be null
}
