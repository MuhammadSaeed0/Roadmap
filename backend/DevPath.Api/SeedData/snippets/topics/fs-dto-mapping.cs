// API side: entity → DTO via projection (only needed columns are read)
public static readonly Expression<Func<Product, ProductDto>> ToDto = p =>
    new ProductDto(p.Id, p.Name, p.Price, p.Category.Name, p.Stock > 0);

var products = await db.Products.AsNoTracking().Select(ToDto).ToListAsync(ct);

// Angular side (TypeScript): DTO → view model with display-only values
// export function toRow(p: ProductDto): ProductRow {
//   return { ...p, priceLabel: formatMoney(p.price), stockLabel: p.inStock ? 'In stock' : 'Out of stock' };
// }
