public sealed record ModelPrice(decimal InputPerMillion, decimal OutputPerMillion);

public sealed class UsageRecorder(ILogger<UsageRecorder> log, IOptions<Dictionary<string, ModelPrice>> prices)
{
    public decimal Record(string feature, string userId, string model, UsageDetails? usage)
    {
        var input = usage?.InputTokenCount ?? 0;
        var output = usage?.OutputTokenCount ?? 0;
        var price = prices.Value[model];
        var cost = input * price.InputPerMillion / 1_000_000m + output * price.OutputPerMillion / 1_000_000m;

        // Structured log: easy to sum per feature, user and day.
        log.LogInformation("AI call {Feature} {User} {Model} in={In} out={Out} cost={Cost}",
            feature, userId, model, input, output, cost);
        return cost;
    }
}
