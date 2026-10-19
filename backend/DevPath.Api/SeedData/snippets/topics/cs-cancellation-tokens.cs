using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));

try
{
    foreach (var item in items)
    {
        cts.Token.ThrowIfCancellationRequested();
        await ProcessAsync(item, cts.Token);
        await Task.Delay(500, cts.Token);
    }
}
catch (OperationCanceledException)
{
    Console.WriteLine("Stopped early");
}

// ASP.NET Core binds the request's token automatically
[HttpGet]
public Task<List<ProductDto>> Get(CancellationToken ct) => productService.ListAsync(ct);
