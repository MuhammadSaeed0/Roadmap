public static class Algo
{
    public static List<List<string>> GroupAnagrams(string[] words) =>
        words.GroupBy(w => new string(w.OrderBy(c => c).ToArray()))
            .Select(g => g.OrderBy(w => w, StringComparer.Ordinal).ToList())
            .OrderBy(g => g[0], StringComparer.Ordinal)
            .ToList();
}
