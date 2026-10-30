using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductService service) : ControllerBase
{
    [HttpGet]
    public IReadOnlyList<ProductDto> List() => service.List();

    [HttpGet("{id:int}")]
    public ActionResult<ProductDto> GetById(int id) => service.Find(id) is { } product ? product : NotFound();

    [HttpPost]
    public ActionResult<ProductDto> Create(SaveProductRequest request)
    {
        var created = service.Create(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public IActionResult Update(int id, SaveProductRequest request) => service.Update(id, request) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id) => service.Delete(id) ? NoContent() : NotFound();
}
