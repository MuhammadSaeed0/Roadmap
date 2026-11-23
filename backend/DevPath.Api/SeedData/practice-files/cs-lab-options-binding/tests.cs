public static class Tests
{
    private static readonly Dictionary<string, string> AppSettings = new() { ["Smtp:Host"] = "localhost", ["Smtp:Port"] = "25" };
    private static readonly Dictionary<string, string> Production = new() { ["Smtp:Host"] = "smtp.example.com", ["Smtp:UseSsl"] = "true" };
    private static readonly Dictionary<string, string> Environment = new() { ["SMTP:PORT"] = "587" };

    [Test("Later sources override earlier ones, case-insensitively")]
    public static void Merge()
    {
        var config = Configuration.Merge(AppSettings, Production, Environment);
        Assert.Equal("smtp.example.com", config["Smtp:Host"]);
        Assert.Equal("587", config["smtp:port"]);
        Assert.Equal("true", config["Smtp:UseSsl"]);
    }

    [Test("The Smtp section binds to SmtpOptions")]
    public static void Bind()
    {
        var options = Configuration.BindSmtp(Configuration.Merge(AppSettings, Production, Environment));
        Assert.Equal("smtp.example.com", options.Host);
        Assert.Equal(587, options.Port);
        Assert.True(options.UseSsl, "UseSsl should be true");
    }

    [Test("Missing keys keep their defaults")]
    public static void Defaults()
    {
        var options = Configuration.BindSmtp(new Dictionary<string, string> { ["Smtp:Host"] = "mail" });
        Assert.Equal(25, options.Port);
        Assert.False(options.UseSsl, "UseSsl defaults to false");
    }

    [Test("Validation lists every problem")]
    public static void Validation()
    {
        Assert.SequenceEqual(Array.Empty<string>(), Configuration.Validate(new SmtpOptions { Host = "mail", Port = 587 }));
        Assert.SequenceEqual(new[] { "Host is required", "Port must be between 1 and 65535" }, Configuration.Validate(new SmtpOptions { Port = 0 }));
    }
}
