using System.Text.RegularExpressions;

public static class Redactor
{
    private static readonly Regex Email = new(@"[\w.+-]+@[\w-]+(\.[\w-]+)+");
    private static readonly Regex Phone = new(@"\+?\d[\d\s-]{6,}\d");

    /// <summary>
    /// Replaces every email address with [email] and every phone number (9 or more digits, which may be separated
    /// by spaces or dashes and may start with +) with [phone]. Everything else stays as it is.
    /// </summary>
    public static string Mask(string text) =>
        Phone.Replace(Email.Replace(text, "[email]"), m => m.Value.Count(char.IsDigit) >= 9 ? "[phone]" : m.Value);
}
