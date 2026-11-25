public static class Tests
{
    [Test("A valid answer is accepted and the category normalised")]
    public static void Valid()
    {
        var (t, problems) = TriageParser.Parse("""{"category":"Billing","priority":3,"summary":"Charged twice"}""");
        Assert.Equal(0, problems.Count);
        Assert.Equal(new TicketTriage("billing", 3, "Charged twice"), t);
    }

    [Test("Every broken rule is reported")]
    public static void Problems()
    {
        var (t, problems) = TriageParser.Parse("""{"category":"refund","priority":9,"summary":""}""");
        Assert.True(t is null, "expected no result");
        Assert.Equal(3, problems.Count);
    }

    [Test("Free text instead of JSON is rejected")]
    public static void NotJson()
    {
        var (t, problems) = TriageParser.Parse("Sure! The category is billing.");
        Assert.True(t is null, "expected no result");
        Assert.SequenceEqual(new[] { "not valid JSON" }, problems);
    }

    [Test("Long summaries are rejected")]
    public static void TooLong()
    {
        var json = "{\"category\":\"bug\",\"priority\":2,\"summary\":\"" + new string('x', 121) + "\"}";
        Assert.True(TriageParser.Parse(json).Triage is null, "expected no result");
    }
}
