using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;

namespace DevPath.Api.Tests;

/// <summary>
/// The single-site production layout: the API serves the built Angular app from wwwroot,
/// deep links fall back to index.html, unknown /api paths stay JSON 404s, and every response
/// carries the browser hardening headers.
/// </summary>
public class HostingTests : IAsyncLifetime
{
    private readonly string _webRoot = Directory.CreateTempSubdirectory("devpath-wwwroot-").FullName;
    private WebRootFactory _factory = null!;

    public async Task InitializeAsync()
    {
        await File.WriteAllTextAsync(Path.Combine(_webRoot, "index.html"), "<!doctype html><title>DevPath</title><app-root></app-root>");
        await File.WriteAllTextAsync(Path.Combine(_webRoot, "boot.js"), "// boot");
        _factory = new WebRootFactory(_webRoot);
        await _factory.InitializeAsync();
    }

    public async Task DisposeAsync()
    {
        await ((IAsyncLifetime)_factory).DisposeAsync();
        Directory.Delete(_webRoot, recursive: true);
    }

    [Theory]
    [InlineData("/")]
    [InlineData("/admin")]
    [InlineData("/verify-email?token=abc")]
    [InlineData("/topics/12")]
    public async Task App_routes_get_the_angular_page_without_signing_in(string path)
    {
        var response = await _factory.CreateClient().GetAsync(path);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("<app-root>", await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Static_files_are_served_and_unknown_api_paths_stay_404()
    {
        var client = _factory.CreateClient();
        Assert.Equal("// boot", await client.GetStringAsync("/boot.js"));

        var missing = await client.GetAsync("/api/does-not-exist");
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
        Assert.DoesNotContain("<app-root>", await missing.Content.ReadAsStringAsync());
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/dashboard")).StatusCode);
    }

    [Fact]
    public async Task Responses_carry_security_headers()
    {
        var response = await _factory.CreateClient().GetAsync("/");
        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").Single());
        var csp = response.Headers.GetValues("Content-Security-Policy").Single();
        Assert.Contains("script-src 'self'", csp);
        Assert.Contains("frame-ancestors 'none'", csp);
    }

    [Fact]
    public async Task State_changing_requests_from_another_site_are_refused()
    {
        var client = _factory.CreateClient();
        using var forged = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = JsonContent.Create(new { email = "a@example.com", password = "Secret123" }),
        };
        forged.Headers.Add("Origin", "https://evil.example");
        var response = await client.SendAsync(forged);
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Contains("bad_origin", await response.Content.ReadAsStringAsync());

        using var sameSite = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = JsonContent.Create(new { email = "a@example.com", password = "Secret123" }),
        };
        sameSite.Headers.Add("Origin", client.BaseAddress!.GetLeftPart(UriPartial.Authority));
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(sameSite)).StatusCode);   // reaches the endpoint

        // The public https address from configuration is accepted even when the request reaches the app as http.
        using var publicSite = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = JsonContent.Create(new { email = "a@example.com", password = "Secret123" }),
        };
        publicSite.Headers.Add("Origin", "https://devpath.test");
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(publicSite)).StatusCode);
    }

    private sealed class WebRootFactory(string webRoot) : ApiFactory
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            base.ConfigureWebHost(builder);
            builder.UseWebRoot(webRoot);
        }
    }
}
