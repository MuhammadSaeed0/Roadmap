using Microsoft.Extensions.AI;

// Program.cs: register the provider once; the rest of the app only knows IChatClient.
IChatClient client = new OllamaApiClient(new Uri("http://localhost:11434"), "llama3.2");
builder.Services.AddChatClient(client).UseLogging();

// A feature service: depends on the interface, so tests can pass a fake.
public sealed class TopicExplainer(IChatClient chat)
{
    public async Task<string> ExplainAsync(string topic, CancellationToken ct)
    {
        List<ChatMessage> messages =
        [
            new(ChatRole.System, "You explain programming topics to first-year students in three short sentences."),
            new(ChatRole.User, $"Explain: {topic}"),
        ];
        var options = new ChatOptions { Temperature = 0.2f, MaxOutputTokens = 300 };

        ChatResponse response = await chat.GetResponseAsync(messages, options, ct);
        return response.Text;
    }
}
