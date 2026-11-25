public sealed record Example(string Input, string Output);

public static class FewShot
{
    /// <summary>
    /// Builds the messages for a few-shot call: the system message, then each example as a "user" message followed by an
    /// "assistant" message, then the input as the last "user" message. Uses at most maxExamples examples, skips examples
    /// with an empty input or output and examples whose input repeats an earlier one (ignoring case), and trims all text.
    /// Throws ArgumentException when the input is empty.
    /// </summary>
    public static List<(string Role, string Text)> Build(string system, IEnumerable<Example> examples, string input, int maxExamples)
    {
        var question = input?.Trim() ?? "";
        if (question.Length == 0) throw new ArgumentException("The input is empty.", nameof(input));

        var messages = new List<(string Role, string Text)> { ("system", system.Trim()) };
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var e in examples)
        {
            if (seen.Count == maxExamples) break;
            var i = e.Input?.Trim() ?? "";
            var o = e.Output?.Trim() ?? "";
            if (i.Length == 0 || o.Length == 0 || !seen.Add(i)) continue;
            messages.Add(("user", i));
            messages.Add(("assistant", o));
        }
        messages.Add(("user", question));
        return messages;
    }
}
