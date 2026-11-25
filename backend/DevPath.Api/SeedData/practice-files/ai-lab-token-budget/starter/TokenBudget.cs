public static class TokenBudget
{
    /// <summary>Rough estimate: one token for every four characters, rounded up. Empty text is 0 tokens.</summary>
    public static int Estimate(string text) => 0;

    /// <summary>Cost in dollars. Prices are per million tokens.</summary>
    public static decimal Cost(long inputTokens, long outputTokens, decimal inputPricePerMillion, decimal outputPricePerMillion) => 0m;

    /// <summary>
    /// Keeps the newest messages that fit: walk from the last message backwards and stop at the first one that
    /// would go over the budget. Returns the kept messages in their original order.
    /// </summary>
    public static List<string> Fit(IReadOnlyList<string> messages, int budgetTokens) => [];
}
