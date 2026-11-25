public sealed record StreamResult(string Text, int Pieces, bool Stopped);

public static class StreamCollector
{
    /// <summary>
    /// Reads every piece of the stream, calls onPiece for each non-empty piece, and returns the full text and the
    /// number of non-empty pieces. If the token is cancelled, stop and return what was received with Stopped = true.
    /// </summary>
    public static Task<StreamResult> CollectAsync(IAsyncEnumerable<string> pieces, Action<string> onPiece, CancellationToken ct) =>
        Task.FromResult(new StreamResult("", 0, false));
}
