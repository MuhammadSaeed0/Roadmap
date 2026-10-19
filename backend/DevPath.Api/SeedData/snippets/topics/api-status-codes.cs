[HttpPut("{id:int}")]
public async Task<IActionResult> Update(int id, UpdateProductRequest request, CancellationToken ct)
{
    var product = await db.Products.FindAsync([id], ct);
    if (product is null) return NotFound();                         // 404

    if (product.IsArchived)
        return Conflict(new { code = "product_archived" });         // 409

    product.Name = request.Name;
    await db.SaveChangesAsync(ct);
    return NoContent();                                             // 204
}

// 200 Ok(body)      201 Created(location, body)   204 NoContent()
// 400 validation    401 not logged in   403 not allowed   404 not found
// 409 conflict      500 unexpected server error
