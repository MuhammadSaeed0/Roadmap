namespace DevPath.Api.Models;

/// <summary>
/// Where visitors came from on one day: a source from a fixed list (the link's utm_source, or "direct"), how many
/// guest visits it brought and how many accounts were created from it. Counts only: no user, IP or browser details.
/// </summary>
public class SourceVisitDaily
{
    public DateOnly Date { get; set; }
    public required string Source { get; set; }
    public int Visits { get; set; }
    public int SignUps { get; set; }
}
