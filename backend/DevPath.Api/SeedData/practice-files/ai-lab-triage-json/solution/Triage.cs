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
    public static (TicketTriage? Triage, List<string> Problems) Parse(string json)
    {
        TicketTriage? t;
        try { t = JsonSerializer.Deserialize<TicketTriage>(json, JsonSerializerOptions.Web); }
        catch (JsonException) { return (null, ["not valid JSON"]); }
        if (t is null) return (null, ["not valid JSON"]);

        var problems = new List<string>();
        var category = (t.Category ?? "").Trim().ToLowerInvariant();
        if (!Categories.Contains(category)) problems.Add($"unknown category '{t.Category}'");
        if (t.Priority is < 1 or > 5) problems.Add($"priority {t.Priority} is not 1-5");
        if (string.IsNullOrWhiteSpace(t.Summary)) problems.Add("empty summary");
        else if (t.Summary.Length > 120) problems.Add("summary longer than 120 characters");
        return problems.Count == 0 ? (t with { Category = category }, problems) : (null, problems);
    }
}
