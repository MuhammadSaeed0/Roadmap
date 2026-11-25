using System.Text.Json;

public sealed record TicketTriage(string Category, int Priority, string Summary);

public static class TriageParser
{
    public static readonly string[] Categories = ["billing", "bug", "account", "feature", "other"];

    /// <summary>
    /// Parses the model's JSON answer (property names in camelCase) and validates it: the category must be one of
    /// Categories (compare ignoring case, return it in lower case), the priority 1 to 5, and the summary non-empty and
    /// at most 120 characters. Returns the triage, or null with the list of problems.
    /// Text that is not valid JSON gives null and the single problem "not valid JSON".
    /// </summary>
    public static (TicketTriage? Triage, List<string> Problems) Parse(string json) => (null, ["not implemented"]);
}
