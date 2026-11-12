public static class Text
{
    public static string Caesar(string text, int shift)
    {
        var result = new char[text.Length];
        for (var i = 0; i < text.Length; i++)
        {
            var c = text[i];
            if (c is >= 'a' and <= 'z' or >= 'A' and <= 'Z')
            {
                var start = char.IsUpper(c) ? 'A' : 'a';
                result[i] = (char)(start + ((c - start + shift) % 26 + 26) % 26);
            }
            else result[i] = c;
        }
        return new string(result);
    }
}
