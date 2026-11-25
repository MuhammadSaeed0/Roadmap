using Microsoft.Extensions.AI;

// Minimal API: the browser receives the answer piece by piece.
app.MapPost("/api/tutor/stream", (TutorRequest body, IChatClient chat, CancellationToken ct) =>
    StreamAnswer(chat, body.Question, ct));

static async IAsyncEnumerable<string> StreamAnswer(IChatClient chat, string question,
    [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
{
    List<ChatMessage> messages = [new(ChatRole.System, "You are a patient tutor."), new(ChatRole.User, question)];

    // ct fires when the user presses Stop or closes the tab: generation stops too.
    await foreach (var update in chat.GetStreamingResponseAsync(messages, cancellationToken: ct))
        if (!string.IsNullOrEmpty(update.Text))
            yield return update.Text;
}

public record TutorRequest(string Question);
