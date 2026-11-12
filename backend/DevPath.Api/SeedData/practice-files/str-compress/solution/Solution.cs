public static class Text
{
    public static string Compress(string text)
    {
        var result = new System.Text.StringBuilder();
        var start = 0;
        for (var i = 1; i <= text.Length; i++)
        {
            if (i < text.Length && text[i] == text[start]) continue;
            result.Append(text[start]);
            if (i - start > 1) result.Append(i - start);
            start = i;
        }
        return result.ToString();
    }
}
