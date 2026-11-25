public static class Tests
{
    static readonly Example[] Examples =
    [
        new("The app crashes when I log in", "bug"),
        new("Please add a dark mode", "feature"),
        new("I was charged twice", "billing"),
    ];

    [Test("Examples become user/assistant pairs before the input")]
    public static void Pairs()
    {
        var m = FewShot.Build("Classify the ticket.", Examples, "Export does nothing", 3);
        Assert.SequenceEqual(new[] { "system", "user", "assistant", "user", "assistant", "user", "assistant", "user" }, m.Select(x => x.Role));
        Assert.Equal(("assistant", "feature"), m[4]);
        Assert.Equal(("user", "Export does nothing"), m[^1]);
    }

    [Test("At most maxExamples examples are used")]
    public static void Limit()
    {
        var m = FewShot.Build("Classify.", Examples, "Hi", 2);
        Assert.Equal(6, m.Count);
    }

    [Test("Empty and repeated examples are skipped, text is trimmed")]
    public static void Skips()
    {
        Example[] messy = [new(" Please add a dark mode ", " feature "), new("", "bug"), new("please ADD a dark mode", "bug"), new("Charged twice", "")];
        var m = FewShot.Build("Classify.", messy, "  Hi  ", 5);
        Assert.SequenceEqual(new[] { ("system", "Classify."), ("user", "Please add a dark mode"), ("assistant", "feature"), ("user", "Hi") }, m);
    }

    [Test("An empty input is rejected")]
    public static void EmptyInput() =>
        Assert.Throws<ArgumentException>(() => FewShot.Build("Classify.", Examples, "   ", 3));
}
