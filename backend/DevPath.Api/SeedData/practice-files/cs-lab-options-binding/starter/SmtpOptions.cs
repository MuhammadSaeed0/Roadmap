public class SmtpOptions
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 25;
    public bool UseSsl { get; set; }
}

public static class Configuration
{
    // Merges configuration sources: a key in a later source overrides the same key in an earlier one
    // (like appsettings.json, then appsettings.Production.json, then environment variables).
    // Keys are case-insensitive, like in ASP.NET Core.
    public static Dictionary<string, string> Merge(params Dictionary<string, string>[] sources) => throw new NotImplementedException();

    // Binds the "Smtp" section (keys "Smtp:Host", "Smtp:Port", "Smtp:UseSsl") to SmtpOptions; missing keys keep the defaults.
    public static SmtpOptions BindSmtp(Dictionary<string, string> config) => throw new NotImplementedException();

    // Returns the problems: "Host is required" and/or "Port must be between 1 and 65535". An empty list means valid.
    public static List<string> Validate(SmtpOptions options) => throw new NotImplementedException();
}
