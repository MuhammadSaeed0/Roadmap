public static class PromptTemplate
{
    /// <summary>The names used as {{name}} in the template, each once, in the order they first appear.</summary>
    public static List<string> Placeholders(string template) => [];

    /// <summary>
    /// Replaces every {{name}} with its value (trimmed). Throws KeyNotFoundException with the message
    /// "Missing value: name" for the first placeholder that has no value. Extra values are ignored.
    /// </summary>
    public static string Render(string template, IReadOnlyDictionary<string, string> values) => template;
}
