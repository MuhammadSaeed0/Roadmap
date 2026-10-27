using System.Collections.Concurrent;
using System.Net.Http.Json;
using DevPath.Api.Data;
using DevPath.Api.Data.Seeding;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DevPath.Api.Tests;

/// <summary>
/// Hosts the real API in memory, but swaps SQL Server for an in-memory SQLite database
/// so tests are fast, isolated and never touch your development database.
/// (SQLite can't verify SQL Server-specific behaviour such as rowversion — see README.)
/// YouTube and email are replaced by fakes, so tests never call the internet.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    public const string Password = "Secret123";
    private readonly SqliteConnection _connection = new("DataSource=:memory:");
    private int _userCount;

    public FakeYouTubeClient YouTube { get; } = new();
    public CapturingEmailSender Emails { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration(config => config.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Database:SkipInitialization"] = "true",   // we create the schema and seed below
            ["Auth:AttemptsPerMinute"] = "100000",       // every test signs up; the limit itself is tested separately
        }));
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddDbContext<AppDbContext>(o => o.UseSqlite(_connection));
            services.RemoveAll<IYouTubeClient>();
            services.AddSingleton<IYouTubeClient>(YouTube);
            services.RemoveAll<IAccountEmailSender>();
            services.AddSingleton<IAccountEmailSender>(Emails);
        });
    }

    public async Task InitializeAsync()
    {
        await _connection.OpenAsync();   // the in-memory database lives as long as this connection
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();
        await scope.ServiceProvider.GetRequiredService<DbSeeder>().SeedAsync();
    }

    /// <summary>A new account, signed in. The client keeps the auth cookie like a browser would.</summary>
    public async Task<HttpClient> CreateUserClientAsync(string? email = null)
    {
        email ??= $"user{Interlocked.Increment(ref _userCount)}-{Guid.NewGuid():N}@example.com";
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/register", new { fullName = "Test User", email, password = Password });
        response.EnsureSuccessStatusCode();
        return client;
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await _connection.DisposeAsync();
        await base.DisposeAsync();
    }
}

/// <summary>Stands in for YouTube. Tests set the search results and lookups they need.</summary>
public class FakeYouTubeClient : IYouTubeClient
{
    public bool IsConfigured { get; set; } = true;
    public Func<string, IReadOnlyList<YouTubeVideo>> Search { get; set; } = _ => [];
    public ConcurrentDictionary<string, VideoLookupResult> Lookups { get; } = new();
    public int SearchCount;

    public Task<IReadOnlyList<YouTubeVideo>> SearchAsync(string query, CancellationToken ct)
    {
        Interlocked.Increment(ref SearchCount);
        return Task.FromResult(Search(query));
    }

    public Task<VideoLookupResult> LookupAsync(string videoId, CancellationToken ct) =>
        Task.FromResult(Lookups.GetValueOrDefault(videoId, new VideoLookupResult(VideoLookupStatus.NotFound)));
}

/// <summary>Keeps password-reset links so tests can follow them.</summary>
public class CapturingEmailSender : IAccountEmailSender
{
    public ConcurrentDictionary<string, string> ResetLinks { get; } = new(StringComparer.OrdinalIgnoreCase);

    public Task SendPasswordResetAsync(string email, string resetLink, CancellationToken ct)
    {
        ResetLinks[email] = resetLink;
        return Task.CompletedTask;
    }
}
