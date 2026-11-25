public static class TokenBudget
{
    /// <summary>Rough estimate: one token for every four characters, rounded up. Empty text is 0 tokens.</summary>
    public static int Estimate(string text) => (int)Math.Ceiling(text.Length / 4.0);

    /// <summary>Cost in dollars. Prices are per million tokens.</summary>
    public static decimal Cost(long inputTokens, long outputTokens, decimal inputPricePerMillion, decimal outputPricePerMillion) =>
        inputTokens * inputPricePerMillion / 1_000_000m + outputTokens * outputPricePerMillion / 1_000_000m;

    /// <summary>
    /// Keeps the newest messages that fit: walk from the last message backwards and stop at the first one that
    /// would go over the budget. Returns the kept messages in their original order.
    /// </summary>
    public static List<string> Fit(IReadOnlyList<string> messages, int budgetTokens)
    {
        var kept = new List<string>();
        var used = 0;
        for (var i = messages.Count - 1; i >= 0; i--)
        {
            var tokens = Estimate(messages[i]);
            if (used + tokens > budgetTokens) break;
            used += tokens;
            kept.Insert(0, messages[i]);
        }
        return kept;
    }
}
