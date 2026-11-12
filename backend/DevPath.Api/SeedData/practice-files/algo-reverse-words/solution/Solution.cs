public static class Algo
{
    public static string ReverseWords(string sentence)
    {
        var words = sentence.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        Array.Reverse(words);
        return string.Join(' ', words);
    }
}
