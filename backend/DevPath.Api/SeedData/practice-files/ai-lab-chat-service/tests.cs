public sealed class FakeModel(string answer) : IChatModel
{
    public List<(string Role, string Text)> Sent { get; private set; } = [];
    public Task<string> CompleteAsync(IReadOnlyList<(string Role, string Text)> messages, CancellationToken ct)
    {
        Sent = [.. messages];
        return Task.FromResult(answer);
    }
}

public static class Tests
{
    [Test("The system prompt comes first and the question last")]
    public static async Task Order()
    {
        var fake = new FakeModel("ok");
        await new Tutor(fake).AskAsync("What is a token?", [], CancellationToken.None);
        Assert.Equal(2, fake.Sent.Count);
        Assert.Equal(("system", Tutor.SystemPrompt), fake.Sent[0]);
        Assert.Equal(("user", "What is a token?"), fake.Sent[1]);
    }

    [Test("History goes between the system prompt and the question")]
    public static async Task History()
    {
        var fake = new FakeModel("ok");
        await new Tutor(fake).AskAsync("And a context window?", [("user", "Hi"), ("assistant", "Hello!")], CancellationToken.None);
        Assert.SequenceEqual(new[] { "system", "user", "assistant", "user" }, fake.Sent.Select(m => m.Role));
    }

    [Test("The question and the answer are trimmed")]
    public static async Task Trims()
    {
        var fake = new FakeModel("  A piece of a word.  ");
        var answer = await new Tutor(fake).AskAsync("   What is a token?  ", [], CancellationToken.None);
        Assert.Equal("A piece of a word.", answer);
        Assert.Equal("What is a token?", fake.Sent[^1].Text);
    }

    [Test("An empty question is rejected before calling the model")]
    public static async Task Empty()
    {
        var fake = new FakeModel("ok");
        try { await new Tutor(fake).AskAsync("   ", [], CancellationToken.None); }
        catch (ArgumentException) { Assert.Equal(0, fake.Sent.Count); return; }
        Assert.True(false, "An empty question should throw ArgumentException.");
    }
}
