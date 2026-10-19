public async Task ReserveAsync(int productId, int quantity, CancellationToken ct)
{
    var updated = await db.Products
        .Where(p => p.Id == productId && p.Stock >= quantity)
        .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - quantity), ct);

    if (updated == 0)
        throw new BusinessRuleException("out_of_stock", "Not enough stock.");
}

// And in the model, as the last line of defence:
// b.Entity<Product>().ToTable(t => t.HasCheckConstraint("CK_Product_Stock", "Stock >= 0"));
