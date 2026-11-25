public sealed record EvalCase(string Name, string[] MustContain, string[] MustNotContain, int MaxWords);

public static class PromptEval
{
    /// <summary>
    /// The problems with one answer, in this order: "missing 'x'" for each MustContain text not found, "contains 'x'" for
    /// each MustNotContain text found (both ignoring case), then "too long: N words" when the answer has more than MaxWords
    /// words (words are separated by spaces; empty entries do not count). An empty list means the answer passed.
    /// </summary>
    public static List<string> Check(EvalCase c, string answer) => [];

    /// <summary>How many cases passed. answers[i] is the answer for cases[i].</summary>
    public static int Passed(IReadOnlyList<EvalCase> cases, IReadOnlyList<string> answers) => 0;

    /// <summary>The names of cases that passed with the old answers but fail with the new ones.</summary>
    public static List<string> Regressions(IReadOnlyList<EvalCase> cases, IReadOnlyList<string> oldAnswers, IReadOnlyList<string> newAnswers) => [];
}
