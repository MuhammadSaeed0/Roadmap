using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/products")]
public class ProductsController(ShopContext db) : ControllerBase
{
    private static ProductDto ToDto(Product p) => new(p.Id, p.Name, p.Price, Convert.ToBase64String(p.RowVersion));

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateProductRequest request)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound();

        db.Entry(product).Property(p => p.RowVersion).OriginalValue = Convert.FromBase64String(request.Version);
        product.Name = request.Name;
        product.Price = request.Price;
        try
        {
            await db.SaveChangesAsync();
            return NoContent();
        }
        catch (DbUpdateConcurrencyException)
        {
            var current = await db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
            return current is null ? NotFound() : Conflict(ToDto(current));
        }
    }
}
