public static class UntrustedText
{
    private static readonly string[] Suspicious = ["ignore previous instructions", "ignore all instructions", "system prompt", "you are now"];

    /// <summary>Wraps outside text as data and removes any tag that could close the wrapper early.</summary>
    public static string Wrap(string tag, string text) =>
        $"<{tag}>{text.Replace($"</{tag}>", "", StringComparison.OrdinalIgnoreCase).Replace($"<{tag}>", "", StringComparison.OrdinalIgnoreCase)}</{tag}>";

    /// <summary>Flags are for logging and review: they never replace permission checks in code.</summary>
    public static string[] Flags(string text) =>
        Suspicious.Where(s => text.Contains(s, StringComparison.OrdinalIgnoreCase)).ToArray();
}

// Defence in depth: the model can only suggest; code checks permissions and the user confirms.
if (suggestion.Action == "delete-project" && !await permissions.CanDeleteAsync(userId, suggestion.ProjectId))
    return Forbid();
