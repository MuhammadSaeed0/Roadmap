public class Repository<T>(AppDbContext db) where T : class
{
    public IEnumerable<T> GetAll() => db.Set<T>().ToList();
}

// Used like this in 12 endpoints:
var recent = repo.GetAll().Where(o => o.CreatedAt > since).Take(20);
