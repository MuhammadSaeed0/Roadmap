public static class Text
{
    public static int CountVowels(string text) => text.Count(c => "aeiou".Contains(char.ToLowerInvariant(c)));
}
