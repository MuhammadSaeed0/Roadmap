public static class Lambdas
{
    public static Func<int, int> MakeMultiplier(int factor) => x => x * factor;

    public static List<T> Where<T>(List<T> items, Func<T, bool> keep)
    {
        var result = new List<T>();
        foreach (var item in items)
            if (keep(item)) result.Add(item);
        return result;
    }

    public static Func<int, int> Then(Func<int, int> first, Func<int, int> second) => x => second(first(x));
}
