using System.Collections.Concurrent;
using System.Net.Http.Json;
using DevPath.Api.Data;
using DevPath.Api.Data.Seeding;
using DevPath.Api.Models;
using DevPath.Api.Services;
using DevPath.Api.Services.Cv;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.WebUtilities;
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
    /// <summary>The configured main administrator for tests (Admin:OwnerEmail).</summary>
    public const string OwnerEmail = "main-admin@example.com";
    private readonly SqliteConnection _connection = new("DataSource=:memory:");
    private readonly SemaphoreSlim _ownerLock = new(1, 1);
    private int _userCount;

    public FakeYouTubeClient YouTube { get; } = new();
    public CapturingEmailSender Emails { get; } = new();
    public FakeCvAiClient CvAi { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration(config => config.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Database:SkipInitialization"] = "true",   // we create the schema and seed below
            ["Auth:AttemptsPerMinute"] = "100000",       // every test signs up; the limit itself is tested separately
            ["Admin:OwnerEmail"] = OwnerEmail,
            ["Frontend:BaseUrl"] = "https://devpath.test",
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
            services.RemoveAll<ICvAiClient>();
            services.AddSingleton<ICvAiClient>(CvAi);
        });
    }

    public async Task InitializeAsync()
    {
        await _connection.OpenAsync();   // the in-memory database lives as long as this connection
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();
        await scope.ServiceProvider.GetRequiredService<DbSeeder>().SeedAsync();
        await scope.ServiceProvider.GetRequiredService<AccountWorkflow>().EnsureOwnerAsync(CancellationToken.None);
    }

    public string NewEmail() => $"user{Interlocked.Increment(ref _userCount)}-{Guid.NewGuid():N}@example.com";

    /// <summary>
    /// A new, approved account, signed in. The client keeps the auth cookie like a browser would.
    /// Verification and approval are done directly in the database; their own tests use the real flow.
    /// </summary>
    public async Task<HttpClient> CreateUserClientAsync(string? email = null)
    {
        email ??= NewEmail();
        var client = await RegisterAsync(email);
        await ApproveInDatabaseAsync(email);
        return client;
    }

    /// <summary>A freshly registered account (waiting for email verification), signed in.</summary>
    public async Task<HttpClient> RegisterAsync(string email, string password = Password)
    {
        var client = CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/register", new { fullName = "Test User", email, password });
        response.EnsureSuccessStatusCode();
        return client;
    }

    public async Task ApproveInDatabaseAsync(string email)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await db.Users.SingleAsync(u => u.Email == email);
        user.EmailConfirmed = true;
        user.EmailVerifiedAt ??= DateTime.UtcNow;
        user.Status = AccountStatus.Approved;
        user.ApprovedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    /// <summary>An approved account that an administrator role was given to (as the owner would).</summary>
    public async Task<(HttpClient Client, string Email)> CreateAdminClientAsync()
    {
        var email = NewEmail();
        var client = await CreateUserClientAsync(email);
        using var scope = Services.CreateScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        await users.AddToRoleAsync((await users.FindByEmailAsync(email))!, Roles.Admin);
        return (client, email);
    }

    /// <summary>
    /// Signed in as the main administrator. The first call creates that account the real way:
    /// registering the configured address, then taking it over through a password-reset link.
    /// </summary>
    public async Task<HttpClient> CreateOwnerClientAsync()
    {
        await _ownerLock.WaitAsync();
        try
        {
            using var scope = Services.CreateScope();
            if (!await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users.AnyAsync(u => u.Email == OwnerEmail))
            {
                var registered = await RegisterAsync(OwnerEmail);
                (await registered.PostAsJsonAsync("/api/auth/forgot-password", new { email = OwnerEmail })).EnsureSuccessStatusCode();
                var token = Emails.LastToken(OwnerEmail, "password-reset");
                (await registered.PostAsJsonAsync("/api/auth/reset-password", new { token, newPassword = Password })).EnsureSuccessStatusCode();
            }
        }
        finally
        {
            _ownerLock.Release();
        }
        var client = CreateClient();
        (await client.PostAsJsonAsync("/api/auth/login", new { email = OwnerEmail, password = Password })).EnsureSuccessStatusCode();
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

/// <summary>Keeps every email so tests can read them and follow their links.</summary>
/// <summary>Stands in for the language model: records the prompt and returns a prepared JSON answer.</summary>
public class FakeCvAiClient : ICvAiClient
{
    public bool Enabled { get; set; } = true;
    public string? Model => "fake-model";
    public string Answer { get; set; } = """{"text":"","bullets":[],"suggestions":[],"matching":[],"missing":[],"notes":[]}""";
    public Exception? Throw { get; set; }
    public string? LastSystem { get; private set; }
    public string? LastPrompt { get; private set; }

    public Task<string> CompleteJsonAsync(string system, string prompt, CancellationToken ct)
    {
        LastSystem = system;
        LastPrompt = prompt;
        return Throw is null ? Task.FromResult(Answer) : Task.FromException<string>(Throw);
    }
}

public class CapturingEmailSender : IAccountEmailSender
{
    public ConcurrentQueue<EmailMessage> Sent { get; } = new();
    /// <summary>When set, sending fails like an unreachable provider would.</summary>
    public bool Fail { get; set; }

    public Task SendAsync(EmailMessage message, CancellationToken ct)
    {
        if (Fail) throw new EmailDeliveryException("The email provider answered 503.");
        Sent.Enqueue(message);
        return Task.CompletedTask;
    }

    public IReadOnlyList<EmailMessage> To(string email, string? kind = null) =>
        Sent.Where(m => string.Equals(m.To, email, StringComparison.OrdinalIgnoreCase) && (kind is null || m.Kind == kind)).ToList();

    public string LastToken(string email, string kind)
    {
        var link = new Uri(To(email, kind).Last().Link!);
        return QueryHelpers.ParseQuery(link.Query)["token"].ToString();
    }
}
