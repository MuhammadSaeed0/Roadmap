public class ReportsController(ReportService reports) : ControllerBase
{
    [HttpGet("sales")]
    public async Task<ActionResult<SalesReport>> Sales(CancellationToken ct)
    {
        var data = await reports.GetSalesAsync(ct);   // thread returns to the pool while waiting
        return data;
    }
}
