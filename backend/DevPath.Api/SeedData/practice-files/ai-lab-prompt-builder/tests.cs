public static class Tests
{
    [Test("Parts come out in a fixed order")]
    public static void Order()
    {
        var prompt = new PromptBuilder()
            .Format("Two sentences.")
            .Task("Answer the question.")
            .Role("You are a tutor.")
            .Build();
        Assert.Equal("## Role\nYou are a tutor.\n\n## Task\nAnswer the question.\n\n## Format\nTwo sentences.", prompt);
    }

    [Test("Rules are listed in the order they were added")]
    public static void Rules()
    {
        var prompt = new PromptBuilder().Task("Classify the ticket.").Rule("Reply with one word.").Rule("  Use lower case. ").Build();
        Assert.Equal("## Task\nClassify the ticket.\n\n## Rules\n- Reply with one word.\n- Use lower case.", prompt);
    }

    [Test("Empty parts and blank rules are left out")]
    public static void Empty()
    {
        var prompt = new PromptBuilder().Role("   ").Task(" Summarise. ").Context("").Rule(" ").Build();
        Assert.Equal("## Task\nSummarise.", prompt);
    }

    [Test("A prompt without a task is refused")]
    public static void NoTask() =>
        Assert.Throws<InvalidOperationException>(() => new PromptBuilder().Role("You are a tutor.").Build());
}
