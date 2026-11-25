using Microsoft.Extensions.AI;

// Ground the answer in facts you supply, allow "I don't know", and let code do the maths.
public async Task<string> AnswerAsync(string question, IReadOnlyList<Article> articles)
{
    var context = string.Join("\n---\n", articles.Select(a => $"[{a.Title}]\n{a.Text}"));

    List<ChatMessage> messages =
    [
        new(ChatRole.System,
            "Answer only from the articles below. Cite the article titles you used. " +
            "If the articles do not contain the answer, reply exactly: I don't know."),
        new(ChatRole.User, $"{context}\n\nQuestion: {question}"),
    ];

    var answer = (await chat.GetResponseAsync(messages, new ChatOptions { Temperature = 0f })).Text;
    return answer;   // show it with the article links, as a suggestion, not as a fact
}

// Never ask the model to add up an invoice: compute totals in code and give it the result.
decimal total = lines.Sum(l => l.Quantity * l.UnitPrice);
