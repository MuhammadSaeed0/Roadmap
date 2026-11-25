public static class InputGuard
{
    public static readonly string[] Suspicious = ["ignore previous instructions", "ignore all instructions", "system prompt", "you are now"];

    /// <summary>
    /// Wraps untrusted text as &lt;tag&gt;text&lt;/tag&gt;. Removes every opening and closing tag with the same name from
    /// the text first (ignoring case) so it cannot end the wrapper early, and trims the result.
    /// </summary>
    public static string Wrap(string tag, string text)
    {
        var cleaned = (text ?? "")
            .Replace($"</{tag}>", "", StringComparison.OrdinalIgnoreCase)
            .Replace($"<{tag}>", "", StringComparison.OrdinalIgnoreCase)
            .Trim();
        return $"<{tag}>{cleaned}</{tag}>";
    }

    /// <summary>The Suspicious phrases found in the text (ignoring case), in the order of the Suspicious list.</summary>
    public static List<string> Flags(string text) =>
        Suspicious.Where(s => (text ?? "").Contains(s, StringComparison.OrdinalIgnoreCase)).ToList();

    /// <summary>Cuts the text to at most maxChars characters, so very long inputs cannot fill the prompt.</summary>
    public static string Limit(string text, int maxChars) =>
        text.Length <= maxChars ? text : text[..maxChars];
}
