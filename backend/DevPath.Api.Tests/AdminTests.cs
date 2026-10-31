using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>The admin area: who may use it, the approval actions, and the owner / admin / user hierarchy.</summary>
public class AdminTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response) =>
        JsonNode.Parse(await response.Content.ReadAsStringAsync())!;

    private static async Task<string?> Code(HttpResponseMessage response) =>
        (await Json(response))["code"]?.GetValue<string>();

    private async Task<string> IdOf(string email)
    {
        using var scope = factory.Services.CreateScope();
        return await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users.Where(u => u.Email == email).Select(u => u.Id).SingleAsync();
    }

    /// <summary>A registered account that has confirmed its email and waits for approval.</summary>
    private async Task<(HttpClient Client, string Email, string Id)> PendingApprovalAsync()
    {
        var email = factory.NewEmail();
        var client = await factory.RegisterAsync(email);
        (await client.PostAsJsonAsync("/api/auth/verify-email", new { token = factory.Emails.LastToken(email, "verification") })).EnsureSuccessStatusCode();
        return (client, email, await IdOf(email));
    }

    [Fact]
    public async Task Admin_area_requires_an_administrator()
    {
        var anonymous = await factory.CreateClient().GetAsync("/api/admin/overview");
        Assert.Equal(HttpStatusCode.Unauthorized, anonymous.StatusCode);

        var user = await factory.CreateUserClientAsync();
        var forbidden = await user.GetAsync("/api/admin/overview");
        Assert.Equal(HttpStatusCode.Forbidden, forbidden.StatusCode);
        Assert.Equal("admin_required", await Code(forbidden));
        Assert.Equal(HttpStatusCode.Forbidden, (await user.GetAsync("/api/admin/users")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await user.PostAsJsonAsync("/api/admin/admins", new { email = "x@example.com" })).StatusCode);
        Assert.False((await Json(await user.GetAsync("/api/auth/me")))["isAdmin"]!.GetValue<bool>());

        var (admin, _) = await factory.CreateAdminClientAsync();
        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/admin/overview")).StatusCode);
        Assert.True((await Json(await admin.GetAsync("/api/auth/me")))["isAdmin"]!.GetValue<bool>());
    }

    [Fact]
    public async Task Admin_approves_a_verified_account_which_then_gets_in_and_is_emailed()
    {
        var (admin, adminEmail) = await factory.CreateAdminClientAsync();
        var (client, email, id) = await PendingApprovalAsync();
        Assert.Equal("account_pending_approval", await Code(await client.GetAsync("/api/dashboard")));

        var approved = await admin.PostAsync($"/api/admin/users/{id}/approve", null);
        Assert.Equal(HttpStatusCode.OK, approved.StatusCode);
        var dto = await Json(approved);
        Assert.Equal("Approved", dto["status"]!.GetValue<string>());
        Assert.Equal(adminEmail, dto["approvedByEmail"]!.GetValue<string>());

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/dashboard")).StatusCode);
        Assert.Single(factory.Emails.To(email, "approved"));

        var audit = await Json(await admin.GetAsync("/api/admin/audit"));
        Assert.Contains(audit.AsArray(), a => a!["action"]!.GetValue<string>() == "approve"
            && a["targetEmail"]!.GetValue<string>() == email && a["actorEmail"]!.GetValue<string>() == adminEmail);

        Assert.Equal("invalid_status", await Code(await admin.PostAsync($"/api/admin/users/{id}/approve", null)));
    }

    [Fact]
    public async Task Approval_needs_a_confirmed_email()
    {
        var (admin, _) = await factory.CreateAdminClientAsync();
        var email = factory.NewEmail();
        await factory.RegisterAsync(email);
        var id = await IdOf(email);

        // Still waiting for verification: approving isn't possible, rejecting is.
        Assert.Equal(HttpStatusCode.Conflict, (await admin.PostAsync($"/api/admin/users/{id}/approve", null)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await admin.PostAsJsonAsync($"/api/admin/users/{id}/reject", new { reason = "Unknown applicant" })).StatusCode);
        Assert.Contains("Unknown applicant", factory.Emails.To(email, "rejected").Single().Text);
    }

    [Fact]
    public async Task Suspend_and_reactivate_take_effect_immediately()
    {
        var (admin, _) = await factory.CreateAdminClientAsync();
        var email = factory.NewEmail();
        var client = await factory.CreateUserClientAsync(email);
        var id = await IdOf(email);

        Assert.Equal(HttpStatusCode.OK, (await admin.PostAsJsonAsync($"/api/admin/users/{id}/suspend", new { reason = "Spam" })).StatusCode);
        var blocked = await client.GetAsync("/api/dashboard");
        Assert.Equal("account_suspended", await Code(blocked));
        Assert.Equal("Spam", (await Json(await client.GetAsync("/api/auth/me")))["statusReason"]?.GetValue<string>());

        Assert.Equal(HttpStatusCode.OK, (await admin.PostAsync($"/api/admin/users/{id}/reactivate", null)).StatusCode);
        var again = factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await again.PostAsJsonAsync("/api/auth/login", new { email, password = ApiFactory.Password })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await again.GetAsync("/api/dashboard")).StatusCode);
    }

    [Fact]
    public async Task Search_and_status_filter()
    {
        var (admin, _) = await factory.CreateAdminClientAsync();
        var (_, email, _) = await PendingApprovalAsync();

        var byEmail = await Json(await admin.GetAsync($"/api/admin/users?q={Uri.EscapeDataString(email[..20])}"));
        Assert.Contains(byEmail["items"]!.AsArray(), u => u!["email"]!.GetValue<string>() == email);

        var pending = await Json(await admin.GetAsync("/api/admin/users?status=PendingApproval&pageSize=100"));
        Assert.All(pending["items"]!.AsArray(), u => Assert.Equal("PendingApproval", u!["status"]!.GetValue<string>()));
        Assert.Contains(pending["items"]!.AsArray(), u => u!["email"]!.GetValue<string>() == email);

        var overview = await Json(await admin.GetAsync("/api/admin/overview"));
        Assert.True(overview["stats"]!["pendingApproval"]!.GetValue<int>() >= 1);
        Assert.False(overview["canManageAdmins"]!.GetValue<bool>());
    }

    [Fact]
    public async Task Administrators_cannot_act_on_themselves_the_owner_or_other_admins()
    {
        var owner = await factory.CreateOwnerClientAsync();
        var (admin, adminEmail) = await factory.CreateAdminClientAsync();
        var (_, otherAdminEmail) = await factory.CreateAdminClientAsync();
        var ownerId = await IdOf(ApiFactory.OwnerEmail);

        Assert.Equal("self_action", await Code(await admin.PostAsJsonAsync($"/api/admin/users/{await IdOf(adminEmail)}/suspend", new { })));
        var onOwner = await admin.PostAsJsonAsync($"/api/admin/users/{ownerId}/suspend", new { });
        Assert.Equal(HttpStatusCode.Forbidden, onOwner.StatusCode);
        Assert.Equal("owner_protected", await Code(onOwner));
        Assert.Equal("owner_required", await Code(await admin.PostAsJsonAsync($"/api/admin/users/{await IdOf(otherAdminEmail)}/suspend", new { })));

        // Role changes are for the owner only, including giving yourself or someone else more rights.
        Assert.Equal("owner_required", await Code(await admin.PostAsJsonAsync("/api/admin/admins", new { email = factory.NewEmail() })));
        Assert.Equal("owner_required", await Code(await admin.DeleteAsync($"/api/admin/admins/{ownerId}")));
        Assert.Equal("owner_required", await Code(await admin.PostAsync("/api/admin/test-email", null)));

        // Even the owner can't remove their own rights or suspend themselves.
        Assert.Equal("self_action", await Code(await owner.DeleteAsync($"/api/admin/admins/{ownerId}")));
        Assert.Equal("self_action", await Code(await owner.PostAsJsonAsync($"/api/admin/users/{ownerId}/suspend", new { })));
        Assert.True((await Json(await owner.GetAsync("/api/auth/me")))["isOwner"]!.GetValue<bool>());
    }

    [Fact]
    public async Task Owner_promotes_and_revokes_administrators()
    {
        var owner = await factory.CreateOwnerClientAsync();
        var email = factory.NewEmail();
        var client = await factory.CreateUserClientAsync(email);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/admin/overview")).StatusCode);

        var promoted = await owner.PostAsJsonAsync("/api/admin/admins", new { email });
        Assert.Equal(HttpStatusCode.OK, promoted.StatusCode);
        Assert.True((await Json(promoted))["isAdmin"]!.GetValue<bool>());
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/admin/overview")).StatusCode);
        Assert.Single(factory.Emails.To(email, "admin-promoted"));
        Assert.Equal("already_admin", await Code(await owner.PostAsJsonAsync("/api/admin/admins", new { email })));

        // The new admin still can't hand out admin rights.
        Assert.Equal("owner_required", await Code(await client.PostAsJsonAsync("/api/admin/admins", new { email = factory.NewEmail() })));

        Assert.Equal(HttpStatusCode.OK, (await owner.DeleteAsync($"/api/admin/admins/{await IdOf(email)}")).StatusCode);
        Assert.Equal("admin_required", await Code(await client.GetAsync("/api/admin/overview")));   // immediately, same session

        var audit = await Json(await owner.GetAsync("/api/admin/audit"));
        Assert.Contains(audit.AsArray(), a => a!["action"]!.GetValue<string>() == "grant_admin" && a["targetEmail"]!.GetValue<string>() == email);
        Assert.Contains(audit.AsArray(), a => a!["action"]!.GetValue<string>() == "revoke_admin" && a["targetEmail"]!.GetValue<string>() == email);
    }

    [Fact]
    public async Task Only_approved_verified_accounts_can_be_promoted()
    {
        var owner = await factory.CreateOwnerClientAsync();
        var email = factory.NewEmail();
        await factory.RegisterAsync(email);
        Assert.Equal("not_eligible", await Code(await owner.PostAsJsonAsync("/api/admin/admins", new { email })));
        Assert.Equal("user_not_found", await Code(await owner.PostAsJsonAsync("/api/admin/admins", new { email = factory.NewEmail() })));
    }

    [Fact]
    public async Task Audit_log_never_contains_tokens_or_passwords()
    {
        var owner = await factory.CreateOwnerClientAsync();
        var (_, email, id) = await PendingApprovalAsync();
        await owner.PostAsync($"/api/admin/users/{id}/approve", null);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var rows = await db.AdminAudit.ToListAsync();
        var token = factory.Emails.LastToken(email, "verification");
        Assert.DoesNotContain(rows, r => (r.Details ?? "").Contains(ApiFactory.Password) || (r.Details ?? "").Contains(token));
    }
}

/// <summary>Start-up set-up of the main administrator, each test on its own database.</summary>
public class OwnerInitializationTests
{
    private static async Task<ApiFactory> StartAsync(Dictionary<string, string?> settings)
    {
        var factory = new ConfiguredFactory(settings);
        await factory.InitializeAsync();
        return factory;
    }

    private static async Task RunEnsureOwnerAsync(ApiFactory factory)
    {
        using var scope = factory.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<AccountWorkflow>().EnsureOwnerAsync(CancellationToken.None);
    }

    [Fact]
    public async Task Owner_password_secret_creates_a_ready_owner_and_repeating_it_changes_nothing()
    {
        var factory = await StartAsync(new() { ["Admin:OwnerPassword"] = "Bootstrap123" });
        try
        {
            await RunEnsureOwnerAsync(factory);
            await RunEnsureOwnerAsync(factory);

            using var scope = factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var owners = await db.Users.Where(u => u.IsOwner).ToListAsync();
            var owner = Assert.Single(owners);
            Assert.Equal(ApiFactory.OwnerEmail, owner.Email);
            Assert.Equal(AccountStatus.Approved, owner.Status);
            Assert.True(await scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>().IsInRoleAsync(owner, Roles.Admin));
            Assert.Equal(1, await db.AdminAudit.CountAsync(a => a.Action == "owner_assigned"));
            Assert.Equal(1, await db.Roles.CountAsync(r => r.Name == Roles.Admin));
            Assert.DoesNotContain("Bootstrap123", owner.PasswordHash);

            var client = factory.CreateClient();
            Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/auth/login", new { email = ApiFactory.OwnerEmail, password = "Bootstrap123" })).StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/admin/overview")).StatusCode);
        }
        finally
        {
            await ((IAsyncLifetime)factory).DisposeAsync();
        }
    }

    [Fact]
    public async Task An_unconfirmed_registration_of_the_owner_address_gets_no_rights()
    {
        var factory = await StartAsync([]);
        try
        {
            var client = await factory.RegisterAsync(ApiFactory.OwnerEmail);
            await RunEnsureOwnerAsync(factory);
            var login = await factory.CreateClient().PostAsJsonAsync("/api/auth/login", new { email = ApiFactory.OwnerEmail, password = ApiFactory.Password });
            Assert.Equal(HttpStatusCode.OK, login.StatusCode);

            using var scope = factory.Services.CreateScope();
            Assert.False(await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users.AnyAsync(u => u.IsOwner));
            Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/admin/overview")).StatusCode);
        }
        finally
        {
            await ((IAsyncLifetime)factory).DisposeAsync();
        }
    }

    [Fact]
    public async Task The_owner_address_is_the_owner_as_soon_as_it_is_confirmed()
    {
        var factory = await StartAsync([]);
        try
        {
            // Sign up with the owner address and confirm it: no approval needed, straight to owner.
            var client = await factory.RegisterAsync(ApiFactory.OwnerEmail);
            var token = factory.Emails.LastToken(ApiFactory.OwnerEmail, "verification");
            var verified = await client.PostAsJsonAsync("/api/auth/verify-email", new { token });
            Assert.Equal(HttpStatusCode.OK, verified.StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/admin/overview")).StatusCode);
            var me = await client.GetFromJsonAsync<System.Text.Json.Nodes.JsonObject>("/api/auth/me");
            Assert.True(me!["isOwner"]!.GetValue<bool>());
            Assert.Equal("Approved", me["status"]!.GetValue<string>());
        }
        finally
        {
            await ((IAsyncLifetime)factory).DisposeAsync();
        }
    }

    [Fact]
    public async Task The_owner_is_restored_at_sign_in_and_start_up_whatever_happened_to_the_account()
    {
        var factory = await StartAsync([]);
        try
        {
            // A confirmed account for the owner address that lost everything: not owner, no role, waiting for approval.
            await factory.RegisterAsync(ApiFactory.OwnerEmail);
            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var user = await db.Users.SingleAsync(u => u.Email == ApiFactory.OwnerEmail);
                user.EmailConfirmed = true;
                user.EmailVerifiedAt = DateTime.UtcNow;
                user.Status = AccountStatus.PendingApproval;
                await db.SaveChangesAsync();
            }

            var client = factory.CreateClient();
            var login = await client.PostAsJsonAsync("/api/auth/login", new { email = ApiFactory.OwnerEmail, password = ApiFactory.Password });
            Assert.Equal(HttpStatusCode.OK, login.StatusCode);
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/admin/overview")).StatusCode);

            // Suspended and demoted behind the API's back (for example by editing the database): the next start-up restores it.
            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var user = await db.Users.SingleAsync(u => u.Email == ApiFactory.OwnerEmail);
                user.Status = AccountStatus.Suspended;
                user.IsOwner = false;
                await db.SaveChangesAsync();
            }
            await RunEnsureOwnerAsync(factory);
            using (var scope = factory.Services.CreateScope())
            {
                var user = await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users.SingleAsync(u => u.Email == ApiFactory.OwnerEmail);
                Assert.True(user.IsOwner);
                Assert.Equal(AccountStatus.Approved, user.Status);
                Assert.True(await scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>().IsInRoleAsync(user, Roles.Admin));
            }
        }
        finally
        {
            await ((IAsyncLifetime)factory).DisposeAsync();
        }
    }

    [Fact]
    public async Task Ownership_moves_to_the_configured_address()
    {
        var factory = await StartAsync(new() { ["Admin:OwnerPassword"] = "Bootstrap123" });
        try
        {
            var other = factory.NewEmail();
            await factory.CreateUserClientAsync(other);
            using (var scope = factory.Services.CreateScope())
            {
                var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Admin:OwnerEmail"] = other,
                }).Build();
                var sp = scope.ServiceProvider;
                var workflow = new AccountWorkflow(sp.GetRequiredService<AppDbContext>(), sp.GetRequiredService<UserManager<AppUser>>(),
                    sp.GetRequiredService<AccountTokenService>(), sp.GetRequiredService<AccountEmails>(), sp.GetRequiredService<IAccountEmailSender>(),
                    config, TimeProvider.System, Microsoft.Extensions.Logging.Abstractions.NullLogger<AccountWorkflow>.Instance);
                await workflow.EnsureOwnerAsync(CancellationToken.None);
            }

            // The newly configured (and confirmed) address is now the only owner; the previous owner stays an administrator.
            using var check = factory.Services.CreateScope();
            var owner = await check.ServiceProvider.GetRequiredService<AppDbContext>().Users.SingleAsync(u => u.IsOwner);
            Assert.Equal(other, owner.Email);
            var previous = await check.ServiceProvider.GetRequiredService<AppDbContext>().Users.SingleAsync(u => u.Email == ApiFactory.OwnerEmail);
            Assert.True(await check.ServiceProvider.GetRequiredService<UserManager<AppUser>>().IsInRoleAsync(previous, Roles.Admin));
        }
        finally
        {
            await ((IAsyncLifetime)factory).DisposeAsync();
        }
    }

    /// <summary>ApiFactory with extra settings layered on top.</summary>
    private sealed class ConfiguredFactory(Dictionary<string, string?> settings) : ApiFactory
    {
        protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
        {
            base.ConfigureWebHost(builder);
            builder.ConfigureAppConfiguration((_, c) => c.AddInMemoryCollection(settings));
        }
    }
}

public class ProductionSettingsTests
{
    private static IConfiguration Config(Dictionary<string, string?> values) =>
        new ConfigurationBuilder().AddInMemoryCollection(values).Build();

    private static Dictionary<string, string?> Complete() => new()
    {
        ["ConnectionStrings:DevPath"] = "Server=db.example;Database=app;User Id=app;Password=x;TrustServerCertificate=True",
        ["Frontend:BaseUrl"] = "https://devpath.example.net",
        ["Admin:OwnerEmail"] = "owner@example.com",
        ["Email:Provider"] = "Brevo",
        ["Email:SenderEmail"] = "no-reply@example.com",
        ["Email:Brevo:ApiKey"] = "key",
    };

    [Fact]
    public void Complete_settings_pass() => Assert.Empty(ProductionSettings.Problems(Config(Complete())));

    [Theory]
    [InlineData("ConnectionStrings:DevPath", "Server=(localdb)\\MSSQLLocalDB;Database=DevPath", "LocalDB")]
    [InlineData("Frontend:BaseUrl", "http://localhost:4200", "localhost")]
    [InlineData("Frontend:BaseUrl", "http://devpath.example.net", "https")]
    [InlineData("Admin:OwnerEmail", "", "OwnerEmail")]
    [InlineData("Email:Provider", "Log", "Brevo")]
    [InlineData("Email:Brevo:ApiKey", "", "ApiKey")]
    [InlineData("Email:SenderEmail", "", "SenderEmail")]
    public void Development_values_are_reported(string key, string value, string mentions)
    {
        var settings = Complete();
        settings[key] = value;
        var problem = Assert.Single(ProductionSettings.Problems(Config(settings)));
        Assert.Contains(mentions, problem);
    }

    [Fact]
    public void Problems_never_include_secret_values()
    {
        var settings = Complete();
        settings["Email:Provider"] = "Log";
        settings["ConnectionStrings:DevPath"] = "Server=(localdb)\\x;Password=TopSecret1";
        Assert.DoesNotContain(ProductionSettings.Problems(Config(settings)), p => p.Contains("TopSecret1"));
    }
}
