[ApiController]
[Route("api/products")]
public class ProductsController(ProductService products) : ControllerBase
{
    [HttpGet]                         // GET api/products?q=mouse
    public Task<List<ProductDto>> List([FromQuery] string? q, CancellationToken ct) =>
        products.ListAsync(q, ct);

    [HttpGet("{id:int}")]             // GET api/products/5
    public async Task<ActionResult<ProductDto>> Get(int id, CancellationToken ct)
    {
        var product = await products.FindAsync(id, ct);
        return product is null ? NotFound() : product;
    }

    [HttpPost]                        // body is bound from JSON
    public async Task<ActionResult<ProductDto>> Create(CreateProductRequest request, CancellationToken ct)
    {
        var created = await products.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }
}
