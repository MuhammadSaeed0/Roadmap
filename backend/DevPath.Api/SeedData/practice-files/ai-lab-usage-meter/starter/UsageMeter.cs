public sealed record Price(decimal InputPerMillion, decimal OutputPerMillion);

public sealed class UsageMeter(IReadOnlyDictionary<string, Price> prices, int dailyTokensPerUser)
{
    /// <summary>Records one call and returns its cost in dollars. Throws KeyNotFoundException for an unknown model.</summary>
    public decimal Record(string user, string feature, string model, int inputTokens, int outputTokens, DateOnly day) => 0m;

    /// <summary>True when the user has used fewer tokens (input + output) than the daily limit on that day.</summary>
    public bool CanCall(string user, DateOnly day) => true;

    /// <summary>Total cost per feature, over all users and days.</summary>
    public IReadOnlyDictionary<string, decimal> CostByFeature() => new Dictionary<string, decimal>();
}
