using System.Text;

public sealed record StreamResult(string Text, int Pieces, bool Stopped);

public static class StreamCollector
{
    /// <summary>
    /// Reads every piece of the stream, calls onPiece for each non-empty piece, and returns the full text and the
    /// number of non-empty pieces. If the token is cancelled, stop and return what was received with Stopped = true.
    /// </summary>
    public static async Task<StreamResult> CollectAsync(IAsyncEnumerable<string> pieces, Action<string> onPiece, CancellationToken ct)
    {
        var text = new StringBuilder();
        var count = 0;
        try
        {
            await foreach (var piece in pieces.WithCancellation(ct))
            {
                if (string.IsNullOrEmpty(piece)) continue;
                onPiece(piece);
                text.Append(piece);
                count++;
                ct.ThrowIfCancellationRequested();
            }
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            return new StreamResult(text.ToString(), count, true);
        }
        return new StreamResult(text.ToString(), count, false);
    }
}
