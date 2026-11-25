using Microsoft.Extensions.AI;

public record TicketTriage(string Category, int Priority, string Summary);

public sealed class TicketTriager(IChatClient chat)
{
    private static readonly string[] Categories = ["billing", "bug", "account", "feature", "other"];

    public async Task<TicketTriage?> TriageAsync(string ticket, CancellationToken ct)
    {
        List<ChatMessage> messages =
        [
            new(ChatRole.System, $"Classify the ticket. Category is one of: {string.Join(", ", Categories)}. Priority is 1 (low) to 5 (urgent)."),
            new(ChatRole.User, ticket),
        ];
        var result = await chat.GetResponseAsync<TicketTriage>(messages, new ChatOptions { Temperature = 0f }, cancellationToken: ct);

        // The model's answer is untrusted input: check it before routing anything.
        return result.TryGetResult(out var triage)
            && Categories.Contains(triage.Category)
            && triage.Priority is >= 1 and <= 5
            ? triage
            : null;   // null = send to the "needs review" queue
    }
}
