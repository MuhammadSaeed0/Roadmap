using System.Text.Json;
using Anthropic;
using Anthropic.Exceptions;
using Anthropic.Models.Messages;

namespace DevPath.Api.Services.Cv;

/// <summary>Sends one prompt to a language model and returns its JSON answer (shaped by <see cref="CvAiClient.Schema"/>).</summary>
public interface ICvAiClient
{
    /// <summary>False when no API key is configured: the AI assistant is then switched off and says so.</summary>
    bool Enabled { get; }
    string? Model { get; }
    Task<string> CompleteJsonAsync(string system, string prompt, CancellationToken ct);
}

/// <summary>
/// Claude through the Anthropic API. The key comes from configuration (<c>Anthropic:ApiKey</c>: user secrets in
/// development, an environment variable in production) and never leaves the server.
/// </summary>
public sealed class CvAiClient : ICvAiClient
{
    private readonly AnthropicClient? _client;
    private readonly ILogger<CvAiClient> _logger;

    public CvAiClient(IConfiguration config, ILogger<CvAiClient> logger)
    {
        _logger = logger;
        var key = config["Anthropic:ApiKey"];
        Model = config["Anthropic:Model"] is { Length: > 0 } model ? model : "claude-opus-5-5";
        if (!string.IsNullOrWhiteSpace(key)) _client = new AnthropicClient { ApiKey = key };
    }

    public bool Enabled => _client is not null;
    public string? Model { get; }

    /// <summary>Every answer has the same shape; fields an action doesn't use are left empty.</summary>
    public static readonly Dictionary<string, JsonElement> Schema = new()
    {
        ["type"] = JsonSerializer.SerializeToElement("object"),
        ["properties"] = JsonSerializer.SerializeToElement(new
        {
            text = new { type = "string" },
            bullets = new { type = "array", items = new { type = "string" } },
            suggestions = new
            {
                type = "array",
                items = new
                {
                    type = "object",
                    properties = new { section = new { type = "string" }, suggestion = new { type = "string" } },
                    required = new[] { "section", "suggestion" },
                    additionalProperties = false,
                },
            },
            matching = new { type = "array", items = new { type = "string" } },
            missing = new { type = "array", items = new { type = "string" } },
            notes = new { type = "array", items = new { type = "string" } },
        }),
        ["required"] = JsonSerializer.SerializeToElement(new[] { "text", "bullets", "suggestions", "matching", "missing", "notes" }),
        ["additionalProperties"] = JsonSerializer.SerializeToElement(false),
    };

    public async Task<string> CompleteJsonAsync(string system, string prompt, CancellationToken ct)
    {
        if (_client is null) throw new ApiProblemException(503, "ai_not_configured", "The AI assistant is not set up on this server.");
        Message response;
        try
        {
            response = await _client.Messages.Create(new MessageCreateParams
            {
                Model = Model!,
                MaxTokens = 8000,
                System = system,
                Messages = [new UserMessageParam { Content = prompt }],
                OutputConfig = new OutputConfig { Format = new JsonOutputFormat { Schema = Schema } },
            }, ct);
        }
        catch (AnthropicRateLimitException)
        {
            throw new ApiProblemException(503, "ai_busy", "The AI assistant is busy. Try again in a minute.");
        }
        catch (AnthropicApiException e)
        {
            _logger.LogWarning(e, "The AI request failed.");
            throw new ApiProblemException(502, "ai_failed", "The AI assistant could not answer. Try again later.");
        }
        catch (HttpRequestException e)
        {
            _logger.LogWarning(e, "The AI service could not be reached.");
            throw new ApiProblemException(502, "ai_failed", "The AI assistant could not answer. Try again later.");
        }

        if (response.StopReason == "refusal")
            throw new ApiProblemException(422, "ai_refused", "The AI assistant declined this request. Rephrase it or edit the text yourself.");
        if (response.StopReason == "max_tokens")
            throw new ApiProblemException(502, "ai_incomplete", "The answer was too long. Try a shorter text.");
        var json = string.Concat(response.Content.Select(b => b.Value).OfType<TextBlock>().Select(t => t.Text));
        if (json.Length == 0) throw new ApiProblemException(502, "ai_failed", "The AI assistant could not answer. Try again later.");
        return json;
    }
}
