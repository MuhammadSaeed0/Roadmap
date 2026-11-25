using Microsoft.Extensions.AI;

// The rest of the app only knows IChatClient, so the provider is a configuration choice.
var provider = builder.Configuration["Ai:Provider"];

IChatClient client = provider switch
{
    // A hosted model, called over the provider's API (key from user secrets or Key Vault).
    "azure" => new AzureOpenAIClient(new Uri(endpoint), new AzureKeyCredential(key))
                   .GetChatClient("gpt-4o-mini").AsIChatClient(),
    // An open-weight model on your own machine or server, through Ollama.
    "ollama" => new OllamaApiClient(new Uri("http://localhost:11434"), "llama3.2"),
    _ => throw new InvalidOperationException($"Unknown AI provider '{provider}'."),
};

builder.Services.AddChatClient(client);
