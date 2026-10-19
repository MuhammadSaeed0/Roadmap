public async Task<DashboardDto> GetDashboardAsync(CancellationToken ct)
{
    var weather = await weatherService.GetAsync(ct);     // ~300 ms
    var rates = await currencyService.GetRatesAsync(ct); // ~300 ms
    var news = await newsService.GetHeadlinesAsync(ct);  // ~300 ms
    return new DashboardDto(weather, rates, news);       // total ~900 ms
}
