public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

public static T Max<T>(T a, T b) where T : IComparable<T> =>
    a.CompareTo(b) >= 0 ? a : b;

public class Repository<T> where T : class
{
    private readonly List<T> _items = [];
    public void Add(T item) => _items.Add(item);
    public IReadOnlyList<T> All() => _items;
}

var biggest = Max(3, 9);              // T inferred as int
var page = new PagedResult<string>(["a", "b"], 1, 20, 2);
