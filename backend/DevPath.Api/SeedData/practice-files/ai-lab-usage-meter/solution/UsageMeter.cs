public sealed record Price(decimal InputPerMillion, decimal OutputPerMillion);

public sealed class UsageMeter(IReadOnlyDictionary<string, Price> prices, int dailyTokensPerUser)
{
    private readonly List<(string User, string Feature, int Tokens, decimal Cost, DateOnly Day)> _calls = [];

    /// <summary>Records one call and returns its cost in dollars. Throws KeyNotFoundException for an unknown model.</summary>
    public decimal Record(string user, string feature, string model, int inputTokens, int outputTokens, DateOnly day)
    {
        var price = prices[model];
        var cost = inputTokens * price.InputPerMillion / 1_000_000m + outputTokens * price.OutputPerMillion / 1_000_000m;
        _calls.Add((user, feature, inputTokens + outputTokens, cost, day));
        return cost;
    }

    /// <summary>True when the user has used fewer tokens (input + output) than the daily limit on that day.</summary>
    public bool CanCall(string user, DateOnly day) =>
        _calls.Where(c => c.User == user && c.Day == day).Sum(c => c.Tokens) < dailyTokensPerUser;

    /// <summary>Total cost per feature, over all users and days.</summary>
    public IReadOnlyDictionary<string, decimal> CostByFeature() =>
        _calls.GroupBy(c => c.Feature).ToDictionary(g => g.Key, g => g.Sum(c => c.Cost));
}
