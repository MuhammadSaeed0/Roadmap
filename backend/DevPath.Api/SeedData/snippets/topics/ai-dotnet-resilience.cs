using System.Net;

public static class AiCalls
{
    /// <summary>Worth retrying: rate limits, server errors and timeouts. Not: bad requests, bad keys, refusals.</summary>
    public static bool IsTransient(HttpStatusCode? status) =>
        status is HttpStatusCode.TooManyRequests or HttpStatusCode.RequestTimeout || (int?)status >= 500;

    public static async Task<string> AskWithTimeoutAsync(IChatClient chat, List<ChatMessage> messages, CancellationToken requestAborted)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(requestAborted);
        timeout.CancelAfter(TimeSpan.FromSeconds(30));
        return (await chat.GetResponseAsync(messages, cancellationToken: timeout.Token)).Text;
    }
}

// Program.cs: retries with backoff, jitter, Retry-After and a circuit breaker for the provider's HttpClient.
builder.Services.AddHttpClient("ai").AddStandardResilienceHandler();
