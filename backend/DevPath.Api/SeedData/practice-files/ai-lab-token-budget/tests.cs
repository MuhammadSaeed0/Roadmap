public static class Tests
{
    [Test("Estimate rounds up: 4 characters is 1 token, 5 is 2, empty is 0")]
    public static void Estimates()
    {
        Assert.Equal(1, TokenBudget.Estimate("abcd"));
        Assert.Equal(2, TokenBudget.Estimate("abcde"));
        Assert.Equal(0, TokenBudget.Estimate(""));
    }

    [Test("Cost adds input and output prices per million tokens")]
    public static void Costs()
    {
        Assert.Equal(0.00345m, TokenBudget.Cost(6_000, 300, 0.50m, 1.50m));
        Assert.Equal(3.5m, TokenBudget.Cost(1_000_000, 1_000_000, 1m, 2.5m));
    }

    [Test("Fit keeps the newest messages that fit, in order")]
    public static void KeepsNewest()
    {
        var messages = new[] { "aaaaaaaaaaaaaaaa", "bbbbbbbb", "cccc" };   // 4, 2 and 1 tokens
        Assert.SequenceEqual(new[] { "bbbbbbbb", "cccc" }, TokenBudget.Fit(messages, 5));
        Assert.SequenceEqual(messages, TokenBudget.Fit(messages, 7));
    }

    [Test("Fit stops at the first message that does not fit")]
    public static void StopsAtFirstTooBig()
    {
        var messages = new[] { "a", "bbbbbbbbbbbbbbbbbbbbbbbb", "cc" };   // 1, 6 and 1 tokens
        Assert.SequenceEqual(new[] { "cc" }, TokenBudget.Fit(messages, 3));
    }
}
