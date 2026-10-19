public async Task ReserveAsync(int productId, int quantity, CancellationToken ct)
{
    var product = await db.Products.FindAsync([productId], ct);
    if (product!.Stock < quantity)
        throw new BusinessRuleException("out_of_stock", "Not enough stock.");

    product.Stock -= quantity;              // two requests can both get here
    await db.SaveChangesAsync(ct);
}
