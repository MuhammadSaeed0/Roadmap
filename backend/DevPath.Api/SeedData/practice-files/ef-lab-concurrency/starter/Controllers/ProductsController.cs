using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/products")]
public class ProductsController(ShopContext db) : ControllerBase
{
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateProductRequest request)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound();
        product.Name = request.Name;
        product.Price = request.Price;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
