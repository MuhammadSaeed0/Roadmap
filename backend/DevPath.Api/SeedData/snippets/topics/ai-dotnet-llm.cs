using Microsoft.Extensions.AI;

// Program.cs: the key comes from configuration (user secrets locally, Key Vault in Azure).
// builder.Services.AddChatClient(new AzureOpenAIClient(endpoint, new AzureKeyCredential(key))
//     .GetChatClient("gpt-4o-mini").AsIChatClient());

public record ProductAnswer(string Answer, int[] ProductIds);

public sealed class ProductAssistant(IChatClient chat, IProductSearch search)
{
    public async Task<ProductAnswer?> AskAsync(string question, CancellationToken ct)
    {
        var matches = await search.TopMatchesAsync(question, take: 3, ct); // vector search (RAG)
        var context = string.Join("\n", matches.Select(p => $"[{p.Id}] {p.Name}: {p.Description}"));

        List<ChatMessage> messages =
        [
            new(ChatRole.System, "Answer only from the products below. If they don't contain the answer, say so.\n" + context),
            new(ChatRole.User, question),
        ];
        var response = await chat.GetResponseAsync<ProductAnswer>(messages,
            new ChatOptions { MaxOutputTokens = 400 }, cancellationToken: ct);
        return response.TryGetResult(out var answer) ? answer : null; // model output is untrusted: validate it
    }
}
