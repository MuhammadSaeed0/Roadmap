public static class Algo
{
    public static int FirstUniqueIndex(string text)
    {
        var counts = new Dictionary<char, int>();
        foreach (var c in text) counts[c] = counts.GetValueOrDefault(c) + 1;
        for (var i = 0; i < text.Length; i++)
            if (counts[text[i]] == 1) return i;
        return -1;
    }
}
