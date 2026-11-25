public static class Tests
{
    const string Template = "Explain {{topic}} to a {{level}} developer. Keep {{topic}} simple.";

    [Test("Placeholders are listed once, in order")]
    public static void Names() =>
        Assert.SequenceEqual(new[] { "topic", "level" }, PromptTemplate.Placeholders(Template));

    [Test("Every placeholder is replaced, values are trimmed")]
    public static void Render()
    {
        var text = PromptTemplate.Render(Template, new Dictionary<string, string> { ["topic"] = " LINQ ", ["level"] = "junior", ["unused"] = "x" });
        Assert.Equal("Explain LINQ to a junior developer. Keep LINQ simple.", text);
    }

    [Test("A missing value names the placeholder")]
    public static void Missing()
    {
        var e = Assert.Throws<KeyNotFoundException>(() => PromptTemplate.Render(Template, new Dictionary<string, string> { ["topic"] = "LINQ" }));
        Assert.Equal("Missing value: level", e.Message);
    }

    [Test("A template without placeholders is returned as it is")]
    public static void Plain() =>
        Assert.Equal("Say hello.", PromptTemplate.Render("Say hello.", new Dictionary<string, string>()));
}
