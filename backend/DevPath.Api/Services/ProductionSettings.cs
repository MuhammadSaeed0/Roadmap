namespace DevPath.Api.Services;

/// <summary>
/// Settings a live deployment must have. Checked at start-up in Production so a missing secret
/// stops the site with a clear log line instead of failing later (e.g. at the first sign-up).
/// Also used by the deployment script's configuration check. Never reports secret values.
/// </summary>
public static class ProductionSettings
{
    public static IReadOnlyList<string> Problems(IConfiguration config)
    {
        var problems = new List<string>();

        var connection = config.GetConnectionString("DevPath");
        if (string.IsNullOrWhiteSpace(connection))
            problems.Add("ConnectionStrings:DevPath is not set (environment variable ConnectionStrings__DevPath).");
        else if (connection.Contains("(localdb)", StringComparison.OrdinalIgnoreCase))
            problems.Add("ConnectionStrings:DevPath still points at LocalDB; use the hosting provider's SQL Server connection string.");

        var baseUrl = config["Frontend:BaseUrl"];
        if (!Uri.TryCreate(baseUrl, UriKind.Absolute, out var uri))
            problems.Add("Frontend:BaseUrl must be the site's public address, e.g. https://example.runasp.net.");
        else if (uri.IsLoopback)
            problems.Add("Frontend:BaseUrl points at localhost; email links would not work for anyone else.");
        else if (uri.Scheme != Uri.UriSchemeHttps)
            problems.Add("Frontend:BaseUrl should use https so links and cookies stay secure.");

        if (string.IsNullOrWhiteSpace(config["Admin:OwnerEmail"]))
            problems.Add("Admin:OwnerEmail is not set, so nobody can administer the site.");

        var provider = config["Email:Provider"] ?? "Log";
        if (provider.Equals("Brevo", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(config["Email:Brevo:ApiKey"]))
                problems.Add("Email:Brevo:ApiKey is not set (environment variable Email__Brevo__ApiKey).");
            if (string.IsNullOrWhiteSpace(config["Email:SenderEmail"]))
                problems.Add("Email:SenderEmail is not set; it must be a sender verified in Brevo.");
        }
        else
        {
            problems.Add($"Email:Provider is \"{provider}\"; in production it must be \"Brevo\" or no verification email is ever delivered.");
        }

        return problems;
    }
}
