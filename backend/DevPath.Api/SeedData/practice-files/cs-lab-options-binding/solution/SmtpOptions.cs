public class SmtpOptions
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 25;
    public bool UseSsl { get; set; }
}

public static class Configuration
{
    public static Dictionary<string, string> Merge(params Dictionary<string, string>[] sources)
    {
        var merged = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var source in sources)
            foreach (var (key, value) in source)
                merged[key] = value;
        return merged;
    }

    public static SmtpOptions BindSmtp(Dictionary<string, string> config)
    {
        var lookup = new Dictionary<string, string>(config, StringComparer.OrdinalIgnoreCase);
        var options = new SmtpOptions();
        if (lookup.TryGetValue("Smtp:Host", out var host)) options.Host = host;
        if (lookup.TryGetValue("Smtp:Port", out var port)) options.Port = int.Parse(port);
        if (lookup.TryGetValue("Smtp:UseSsl", out var ssl)) options.UseSsl = bool.Parse(ssl);
        return options;
    }

    public static List<string> Validate(SmtpOptions options)
    {
        var problems = new List<string>();
        if (string.IsNullOrWhiteSpace(options.Host)) problems.Add("Host is required");
        if (options.Port is < 1 or > 65535) problems.Add("Port must be between 1 and 65535");
        return problems;
    }
}
