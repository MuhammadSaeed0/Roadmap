public record EvalCase(string Input, string[] MustContain, string[] MustNotContain, int MaxWords);

public static class PromptEval
{
    public static List<string> Check(EvalCase c, string answer)
    {
        var problems = new List<string>();
        problems.AddRange(c.MustContain.Where(s => !answer.Contains(s, StringComparison.OrdinalIgnoreCase)).Select(s => $"missing '{s}'"));
        problems.AddRange(c.MustNotContain.Where(s => answer.Contains(s, StringComparison.OrdinalIgnoreCase)).Select(s => $"contains '{s}'"));
        var words = answer.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
        if (words > c.MaxWords) problems.Add($"{words} words, limit {c.MaxWords}");
        return problems;
    }
}

// Run the same set on two prompt versions and compare before shipping:
// v3: 46/50 passed   v4: 41/50 passed   regressions: refund-outside-policy, wrong-language, ...
