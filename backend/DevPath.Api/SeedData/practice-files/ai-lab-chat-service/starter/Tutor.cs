// A small stand-in for IChatClient, so the exercise runs without any package or key.
public interface IChatModel
{
    Task<string> CompleteAsync(IReadOnlyList<(string Role, string Text)> messages, CancellationToken ct);
}

public sealed class Tutor(IChatModel model)
{
    public const string SystemPrompt = "You are a patient tutor. Answer in at most three sentences.";

    /// <summary>
    /// Sends the system prompt, then the earlier turns (history, oldest first), then the question as a user message.
    /// Trims the question and throws ArgumentException when it is empty. Returns the model's answer trimmed.
    /// </summary>
    public Task<string> AskAsync(string question, IReadOnlyList<(string Role, string Text)> history, CancellationToken ct) =>
        Task.FromResult("");
}
