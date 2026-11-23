public static class Importer
{
    public static async Task<int> ImportAsync(IEnumerable<string> rows, Func<string, Task> importRow, CancellationToken ct)
    {
        var count = 0;
        foreach (var row in rows)
        {
            ct.ThrowIfCancellationRequested();
            await importRow(row);
            count++;
        }
        return count;
    }
}
