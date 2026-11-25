public sealed class PromptBuilder
{
    public PromptBuilder Role(string text) => this;
    public PromptBuilder Task(string text) => this;
    public PromptBuilder Context(string text) => this;
    public PromptBuilder Format(string text) => this;
    public PromptBuilder Rule(string text) => this;

    /// <summary>
    /// Joins the parts in a fixed order: Role, Task, Context, Format, Rules. Each part is "## Name" on one line and its
    /// trimmed text on the next; parts are separated by a blank line. Empty parts are left out. Rules are listed as
    /// "- rule" lines under "## Rules", in the order they were added. Throws InvalidOperationException without a task.
    /// </summary>
    public string Build() => "";
}
