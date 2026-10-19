public class ReportsController(ReportService reports) : ControllerBase
{
    [HttpGet("sales")]
    public IActionResult Sales()
    {
        var data = reports.GetSalesAsync().Result;   // blocks a thread while SQL runs
        return Ok(data);
    }
}
