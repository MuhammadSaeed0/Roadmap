public sealed class PromptBuilder
{
    private string _role = "", _task = "", _context = "", _format = "";
    private readonly List<string> _rules = [];

    public PromptBuilder Role(string text) { _role = text?.Trim() ?? ""; return this; }
    public PromptBuilder Task(string text) { _task = text?.Trim() ?? ""; return this; }
    public PromptBuilder Context(string text) { _context = text?.Trim() ?? ""; return this; }
    public PromptBuilder Format(string text) { _format = text?.Trim() ?? ""; return this; }
    public PromptBuilder Rule(string text)
    {
        if (!string.IsNullOrWhiteSpace(text)) _rules.Add(text.Trim());
        return this;
    }

    /// <summary>
    /// Joins the parts in a fixed order: Role, Task, Context, Format, Rules. Each part is "## Name" on one line and its
    /// trimmed text on the next; parts are separated by a blank line. Empty parts are left out. Rules are listed as
    /// "- rule" lines under "## Rules", in the order they were added. Throws InvalidOperationException without a task.
    /// </summary>
    public string Build()
    {
        if (_task.Length == 0) throw new InvalidOperationException("A prompt needs a task.");
        var parts = new List<string>();
        void Add(string name, string text) { if (text.Length > 0) parts.Add($"## {name}\n{text}"); }
        Add("Role", _role);
        Add("Task", _task);
        Add("Context", _context);
        Add("Format", _format);
        Add("Rules", string.Join("\n", _rules.Select(r => "- " + r)));
        return string.Join("\n\n", parts);
    }
}
