public static class Importer
{
    // Imports the rows one by one (each import is simulated by calling importRow) and returns how many were imported.
    // Stop as soon as the token is cancelled by throwing OperationCanceledException,
    // checking the token before every row (also before the first one).
    public static async Task<int> ImportAsync(IEnumerable<string> rows, Func<string, Task> importRow, CancellationToken ct)
    {
        var count = 0;
        foreach (var row in rows)
        {
            await importRow(row);
            count++;
        }
        return count;
    }
}
