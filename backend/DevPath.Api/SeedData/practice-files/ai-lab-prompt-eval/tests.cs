public static class Tests
{
    static readonly EvalCase Refund = new("refund", ["30 days"], ["guarantee"], 12);
    static readonly EvalCase Unknown = new("unknown", ["colleague"], [], 12);

    [Test("A good answer has no problems")]
    public static void Good() =>
        Assert.Equal(0, PromptEval.Check(Refund, "Refunds are possible within 30 Days of delivery.").Count);

    [Test("Every broken check is reported, in order")]
    public static void Problems()
    {
        var problems = PromptEval.Check(Refund, "We guarantee a full refund, no questions asked, whenever you like, for any reason at all.");
        Assert.SequenceEqual(new[] { "missing '30 days'", "contains 'guarantee'", "too long: 16 words" }, problems);
    }

    [Test("Extra spaces do not count as words")]
    public static void Spaces() =>
        Assert.Equal(0, PromptEval.Check(Unknown, "  A   colleague  will   reply.  ").Count);

    [Test("Pass count and regressions compare two prompt versions")]
    public static void Compare()
    {
        EvalCase[] cases = [Refund, Unknown];
        string[] v1 = ["Refunds are possible within 30 days.", "I don't know."];
        string[] v2 = ["We guarantee refunds within 30 days.", "A colleague will reply today."];
        Assert.Equal(1, PromptEval.Passed(cases, v1));
        Assert.Equal(1, PromptEval.Passed(cases, v2));
        Assert.SequenceEqual(new[] { "refund" }, PromptEval.Regressions(cases, v1, v2));
    }
}
