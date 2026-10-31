public static class TextStats
{
    private static string[] Words(string text) => text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);

    public static int CountWords(string text) => Words(text).Length;

    public static string LongestWord(string text)
    {
        var longest = "";
        foreach (var word in Words(text))
            if (word.Length > longest.Length) longest = word;
        return longest;
    }

    public static string Capitalize(string text) =>
        string.Join(" ", Words(text).Select(w => char.ToUpper(w[0]) + w[1..]));
}
