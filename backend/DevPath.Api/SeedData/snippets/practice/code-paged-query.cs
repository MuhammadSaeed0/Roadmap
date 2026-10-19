public record ProductDto(int Id, string Name, decimal Price);
public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

public async Task<PagedResult<ProductDto>> ListAsync(int page, int pageSize, CancellationToken ct)
{
    // TODO
    throw new NotImplementedException();
}
