public static class Tests
{
    private static readonly string[] Rows = ["a", "b", "c", "d", "e"];

    [Test("Without cancellation every row is imported")]
    public static async Task AllRows()
    {
        var imported = new List<string>();
        var count = await Importer.ImportAsync(Rows, r => { imported.Add(r); return Task.CompletedTask; }, CancellationToken.None);
        Assert.Equal(5, count);
        Assert.SequenceEqual(Rows, imported);
    }

    [Test("An already cancelled token imports nothing and throws")]
    public static async Task CancelledBefore()
    {
        using var cts = new CancellationTokenSource();
        cts.Cancel();
        var imported = 0;
        var thrown = false;
        try { await Importer.ImportAsync(Rows, _ => { imported++; return Task.CompletedTask; }, cts.Token); }
        catch (OperationCanceledException) { thrown = true; }
        Assert.True(thrown, "expected OperationCanceledException");
        Assert.Equal(0, imported);
    }

    [Test("Cancelling during the import stops before the next row")]
    public static async Task CancelledMidway()
    {
        using var cts = new CancellationTokenSource();
        var imported = new List<string>();
        var thrown = false;
        try
        {
            await Importer.ImportAsync(Rows, r =>
            {
                imported.Add(r);
                if (r == "b") cts.Cancel();   // e.g. the user closed the page
                return Task.CompletedTask;
            }, cts.Token);
        }
        catch (OperationCanceledException) { thrown = true; }
        Assert.True(thrown, "expected OperationCanceledException");
        Assert.SequenceEqual(new[] { "a", "b" }, imported);
    }
}
