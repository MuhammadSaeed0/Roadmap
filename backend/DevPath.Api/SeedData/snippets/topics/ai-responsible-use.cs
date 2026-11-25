using System.Text.RegularExpressions;

// Remove personal data the feature does not need before the text leaves your server.
public static partial class Redactor
{
    [GeneratedRegex(@"[\w.+-]+@[\w-]+\.[\w.]+")]
    private static partial Regex Email();

    [GeneratedRegex(@"\+?\d[\d\s-]{7,}\d")]
    private static partial Regex Phone();

    public static string Mask(string text) =>
        Phone().Replace(Email().Replace(text, "[email]"), "[phone]");
}

var ticket = "Call me on 0100 123 4567 or write to sara@example.com about order 42.";
Console.WriteLine(Redactor.Mask(ticket));
// Call me on [phone] or write to [email] about order 42.
