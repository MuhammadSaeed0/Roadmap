public sealed record Example(string Input, string Output);

public static class FewShot
{
    /// <summary>
    /// Builds the messages for a few-shot call: the system message, then each example as a "user" message followed by an
    /// "assistant" message, then the input as the last "user" message. Uses at most maxExamples examples, skips examples
    /// with an empty input or output and examples whose input repeats an earlier one (ignoring case), and trims all text.
    /// Throws ArgumentException when the input is empty.
    /// </summary>
    public static List<(string Role, string Text)> Build(string system, IEnumerable<Example> examples, string input, int maxExamples) => [];
}
