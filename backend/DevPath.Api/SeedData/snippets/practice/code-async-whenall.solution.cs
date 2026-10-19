public async Task<DashboardDto> GetDashboardAsync(CancellationToken ct)
{
    // Start all three first...
    var weatherTask = weatherService.GetAsync(ct);
    var ratesTask = currencyService.GetRatesAsync(ct);
    var newsTask = newsService.GetHeadlinesAsync(ct);

    // ...then wait for all of them (~300 ms total). If any fails, the exception is thrown here.
    await Task.WhenAll(weatherTask, ratesTask, newsTask);

    return new DashboardDto(weatherTask.Result, ratesTask.Result, newsTask.Result);
}
