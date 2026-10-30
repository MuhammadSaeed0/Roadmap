public interface IProductService
{
    IReadOnlyList<ProductDto> List();
    ProductDto? Find(int id);
    ProductDto Create(SaveProductRequest request);
    bool Update(int id, SaveProductRequest request);
    bool Delete(int id);
}
