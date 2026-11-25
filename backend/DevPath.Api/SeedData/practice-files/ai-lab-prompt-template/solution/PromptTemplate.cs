public static class PromptTemplate
{
    /// <summary>The names used as {{name}} in the template, each once, in the order they first appear.</summary>
    public static List<string> Placeholders(string template)
    {
        var names = new List<string>();
        for (var start = template.IndexOf("{{"); start >= 0; start = template.IndexOf("{{", start + 2))
        {
            var end = template.IndexOf("}}", start + 2);
            if (end < 0) break;
            var name = template[(start + 2)..end].Trim();
            if (name.Length > 0 && !names.Contains(name)) names.Add(name);
        }
        return names;
    }

    /// <summary>
    /// Replaces every {{name}} with its value (trimmed). Throws KeyNotFoundException with the message
    /// "Missing value: name" for the first placeholder that has no value. Extra values are ignored.
    /// </summary>
    public static string Render(string template, IReadOnlyDictionary<string, string> values)
    {
        var result = template;
        foreach (var name in Placeholders(template))
        {
            if (!values.TryGetValue(name, out var value)) throw new KeyNotFoundException($"Missing value: {name}");
            result = result.Replace("{{" + name + "}}", value.Trim());
        }
        return result;
    }
}
