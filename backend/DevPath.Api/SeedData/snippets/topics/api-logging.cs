public class ProductService(AppDbContext db, ILogger<ProductService> logger)
{
    public async Task RemoveStockAsync(int productId, int quantity, CancellationToken ct)
    {
        var product = await db.Products.FindAsync([productId], ct)
            ?? throw new NotFoundException("Product", productId);

        product.Stock -= quantity;
        await db.SaveChangesAsync(ct);

        // ✅ message template: ProductId and Stock become searchable properties
        logger.LogInformation("Removed {Quantity} from product {ProductId}", quantity, productId);
        if (product.Stock < 5)
            logger.LogWarning("Product {ProductId} is low on stock ({Stock})", productId, product.Stock);

        // ❌ logger.LogInformation($"Removed {quantity} from {productId}");
    }
}
