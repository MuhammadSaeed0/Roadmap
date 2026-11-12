public static class Algo
{
    public static bool AreAnagrams(string first, string second)
    {
        var counts = new Dictionary<char, int>();
        foreach (var c in first)
            if (c != ' ') counts[char.ToLowerInvariant(c)] = counts.GetValueOrDefault(char.ToLowerInvariant(c)) + 1;
        foreach (var c in second)
            if (c != ' ') counts[char.ToLowerInvariant(c)] = counts.GetValueOrDefault(char.ToLowerInvariant(c)) - 1;
        return counts.Values.All(v => v == 0);
    }
}
