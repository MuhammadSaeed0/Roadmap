using System.ComponentModel.DataAnnotations;

public sealed class AiOptions
{
    [Required, Url] public string Endpoint { get; init; } = "";
    [Required] public string Model { get; init; } = "";
    public string? ApiKey { get; init; }             // user secrets locally, Key Vault or env var (Ai__ApiKey) in production
    [Range(1, 4000)] public int MaxOutputTokens { get; init; } = 400;
}

// Program.cs: fail at start, not at the first request, when settings are missing.
builder.Services.AddOptions<AiOptions>()
    .Bind(builder.Configuration.GetSection("Ai"))
    .ValidateDataAnnotations()
    .ValidateOnStart();

// Terminal (development only):
//   dotnet user-secrets init
//   dotnet user-secrets set "Ai:ApiKey" "sk-..."
