public class InsufficientStockException(int productId, int requested, int available)
    : Exception($"Product {productId}: requested {requested}, only {available} available.");

try
{
    var text = File.ReadAllText("settings.json");
}
catch (FileNotFoundException ex)
{
    Console.WriteLine($"Settings file missing: {ex.FileName}");
}
catch (IOException ex) when (ex.HResult == -2147024864)
{
    Console.WriteLine("The file is locked by another process.");
}
finally
{
    Console.WriteLine("Always runs");
}

// Re-throw without losing the stack trace
try { Process(); }
catch (Exception ex) { logger.LogError(ex, "Processing failed"); throw; }
