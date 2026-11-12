public static class Text
{
    public static string TitleCase(string sentence) =>
        string.Join(' ', sentence.Split(' ').Select(w => w.Length == 0 ? w : char.ToUpperInvariant(w[0]) + w[1..].ToLowerInvariant()));
}
