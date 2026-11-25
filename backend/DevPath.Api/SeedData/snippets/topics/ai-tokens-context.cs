// Cost of one call = input tokens × input price + output tokens × output price.
// Prices are per million tokens; read the real counts from the response's usage data.
public static decimal CallCost(long inputTokens, long outputTokens, decimal inputPricePerMillion, decimal outputPricePerMillion) =>
    inputTokens * inputPricePerMillion / 1_000_000m + outputTokens * outputPricePerMillion / 1_000_000m;

// 6,000 tokens in, 300 out, at $0.50 and $1.50 per million:
Console.WriteLine(CallCost(6_000, 300, 0.50m, 1.50m));   // 0.00345

// Always cap the answer's length so one request can't run up the bill.
var options = new ChatOptions { MaxOutputTokens = 400 };
ChatResponse response = await chat.GetResponseAsync(messages, options);
Console.WriteLine($"in: {response.Usage?.InputTokenCount}, out: {response.Usage?.OutputTokenCount}");
