public static class Algo
{
    public static int LongestUniqueLength(string text)
    {
        var last = new Dictionary<char, int>();
        int start = 0, best = 0;
        for (var i = 0; i < text.Length; i++)
        {
            if (last.TryGetValue(text[i], out var seen) && seen >= start) start = seen + 1;
            last[text[i]] = i;
            best = Math.Max(best, i - start + 1);
        }
        return best;
    }
}
