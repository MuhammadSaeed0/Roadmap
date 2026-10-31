using System.Collections.Concurrent;

public class InMemoryProductService : IProductService
{
    private readonly ConcurrentDictionary<int, ProductDto> products = new();
    private int nextId;

    public IReadOnlyList<ProductDto> List() => products.Values.OrderBy(p => p.Id).ToList();
    public ProductDto? Find(int id) => products.GetValueOrDefault(id);

    public ProductDto Create(SaveProductRequest r)
    {
        var dto = new ProductDto(Interlocked.Increment(ref nextId), r.Name, r.Price, r.Stock);
        products[dto.Id] = dto;
        return dto;
    }

    public bool Update(int id, SaveProductRequest r)
    {
        if (!products.ContainsKey(id)) return false;
        products[id] = new ProductDto(id, r.Name, r.Price, r.Stock);
        return true;
    }

    public bool Delete(int id) => products.TryRemove(id, out _);
}
