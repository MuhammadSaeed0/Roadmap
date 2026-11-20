namespace DevPath.Api.Models;

/// <summary>
/// How many times a page was opened on one day. Only the route pattern (such as "topics/:id") and a count are
/// stored: no user, no ids from the URL, no IP or browser details.
/// </summary>
public class PageViewDaily
{
    public DateOnly Date { get; set; }
    public required string Route { get; set; }
    public int Views { get; set; }
}
