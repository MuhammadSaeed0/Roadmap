public static class Tests
{
    static async IAsyncEnumerable<string> Stream(params string[] pieces)
    {
        foreach (var p in pieces)
        {
            await Task.Yield();
            yield return p;
        }
    }

    [Test("The pieces are joined into the full text")]
    public static async Task Joins()
    {
        var result = await StreamCollector.CollectAsync(Stream("A token ", "is a piece ", "of a word."), _ => { }, CancellationToken.None);
        Assert.Equal("A token is a piece of a word.", result.Text);
        Assert.Equal(3, result.Pieces);
        Assert.False(result.Stopped, "nothing stopped this stream");
    }

    [Test("Each non-empty piece is shown as it arrives")]
    public static async Task CallsBack()
    {
        var shown = new List<string>();
        await StreamCollector.CollectAsync(Stream("Hi", "", " there"), shown.Add, CancellationToken.None);
        Assert.SequenceEqual(new[] { "Hi", " there" }, shown);
    }

    [Test("Stop keeps what was received so far")]
    public static async Task Stops()
    {
        using var cts = new CancellationTokenSource();
        var result = await StreamCollector.CollectAsync(Stream("one ", "two ", "three"), p => { if (p == "two ") cts.Cancel(); }, cts.Token);
        Assert.True(result.Stopped, "the stream was stopped");
        Assert.Equal("one two ", result.Text);
    }
}
