public class CategoryCache(IMemoryCache cache, AppDbContext db)
{
    private const string Key = "categories";

    public Task<List<CategoryDto>> GetAllAsync(CancellationToken ct) =>
        cache.GetOrCreateAsync(Key, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
            return await db.Categories.AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new CategoryDto(c.Id, c.Name))
                .ToListAsync(ct);
        })!;

    public void Invalidate() => cache.Remove(Key);   // call after creating/updating a category
}
