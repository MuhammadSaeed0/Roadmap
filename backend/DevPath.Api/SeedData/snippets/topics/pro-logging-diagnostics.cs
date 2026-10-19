public async Task ShipAsync(int orderId, CancellationToken ct)
{
    using var scope = logger.BeginScope(new Dictionary<string, object> { ["OrderId"] = orderId });
    try
    {
        // ... business logic ...
        logger.LogInformation("Order shipped with {LineCount} lines", order.Lines.Count);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Shipping failed");     // exception + OrderId from the scope
        throw;
    }
}

// Never: logger.LogInformation("Login {Email} {Password}", email, password);

// Runtime diagnostics without a debugger:
//   dotnet-counters monitor --process-id <pid>
//   dotnet-trace collect --process-id <pid>
