public static class Queries
{
    public static Dictionary<string, int> WordFrequency(string text) =>
        text.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .GroupBy(w => w.ToLowerInvariant())
            .ToDictionary(g => g.Key, g => g.Count());
}
