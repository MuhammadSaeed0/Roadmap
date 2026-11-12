using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>The site as deployed: approval is off, so confirming the email address is enough to get in.</summary>
public class OpenSignUpFactory : ApiFactory
{
    protected override bool RequireApproval => false;
}

public class OpenSignUpTests(OpenSignUpFactory factory) : IClassFixture<OpenSignUpFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response) => JsonNode.Parse(await response.Content.ReadAsStringAsync())!;

    [Fact]
    public async Task Confirming_the_email_lets_a_new_user_in_without_waiting_for_an_administrator()
    {
        var email = factory.NewEmail();
        var client = await factory.RegisterAsync(email);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/dashboard")).StatusCode);

        var token = factory.Emails.LastToken(email, "verification");
        var verified = await client.PostAsJsonAsync("/api/auth/verify-email", new { token });
        Assert.Equal(HttpStatusCode.OK, verified.StatusCode);
        Assert.Equal("Approved", (await Json(verified))["status"]!.GetValue<string>());

        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/dashboard")).StatusCode);
        using var scope = factory.Services.CreateScope();
        var user = await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users.SingleAsync(u => u.Email == email);
        Assert.NotNull(user.ApprovedAt);
    }

    [Fact]
    public async Task Accounts_already_waiting_are_approved_at_start_up()
    {
        var email = factory.NewEmail();
        await factory.RegisterAsync(email);
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var user = await db.Users.SingleAsync(u => u.Email == email);
            user.EmailConfirmed = true;
            user.EmailVerifiedAt = DateTime.UtcNow;
            user.Status = AccountStatus.PendingApproval;
            await db.SaveChangesAsync();
        }

        using (var scope = factory.Services.CreateScope())
            await scope.ServiceProvider.GetRequiredService<AccountWorkflow>().EnsureOwnerAsync(CancellationToken.None);

        using var check = factory.Services.CreateScope();
        var after = check.ServiceProvider.GetRequiredService<AppDbContext>();
        var approved = await after.Users.SingleAsync(u => u.Email == email);
        Assert.Equal(AccountStatus.Approved, approved.Status);
        Assert.True(await after.AdminAudit.AnyAsync(a => a.TargetEmail == email && a.Action == "approve"));
    }

    [Fact]
    public async Task An_unconfirmed_address_is_still_blocked()
    {
        var client = await factory.RegisterAsync(factory.NewEmail());
        var response = await client.GetAsync("/api/dashboard");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Contains("account_pending_verification", await response.Content.ReadAsStringAsync());
    }
}
