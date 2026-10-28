using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>Email verification and the approval states, over real HTTP.</summary>
public class AccountApprovalTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response) =>
        JsonNode.Parse(await response.Content.ReadAsStringAsync())!;

    private static async Task<string?> Code(HttpResponseMessage response) =>
        (await Json(response))["code"]?.GetValue<string>();

    private static Task<HttpResponseMessage> Verify(HttpClient client, string token) =>
        client.PostAsJsonAsync("/api/auth/verify-email", new { token });

    private async Task<AppUser> UserAsync(string email)
    {
        using var scope = factory.Services.CreateScope();
        return await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users.AsNoTracking().SingleAsync(u => u.Email == email);
    }

    private async Task SetStatusAsync(string email, AccountStatus status)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await db.Users.SingleAsync(u => u.Email == email);
        user.Status = status;
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task Sign_up_sends_a_verification_link_and_stores_only_its_hash()
    {
        var email = factory.NewEmail();
        await factory.RegisterAsync(email);

        var message = factory.Emails.To(email, "verification").Single();
        Assert.StartsWith("https://devpath.test/verify-email?token=", message.Link);
        var token = factory.Emails.LastToken(email, "verification");
        Assert.True(token.Length >= 40);

        using var scope = factory.Services.CreateScope();
        var userId = (await UserAsync(email)).Id;
        var stored = await scope.ServiceProvider.GetRequiredService<AppDbContext>().AccountTokens
            .Where(t => t.UserId == userId).Select(t => t.TokenHash).SingleAsync();
        Assert.NotEqual(token, stored);
        Assert.Equal(AccountTokenService.Hash(token), stored);
        Assert.DoesNotContain(token, message.Text.Replace(message.Link!, ""));   // the token is only inside the link
    }

    [Fact]
    public async Task Unverified_and_unapproved_accounts_are_blocked_with_a_clear_code()
    {
        var email = factory.NewEmail();
        var client = await factory.RegisterAsync(email);

        var blocked = await client.GetAsync("/api/dashboard");
        Assert.Equal(HttpStatusCode.Forbidden, blocked.StatusCode);
        Assert.Equal("account_pending_verification", await Code(blocked));
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/notes", new { title = "x" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/auth/me")).StatusCode);   // can still see their own status

        Assert.Equal(HttpStatusCode.OK, (await Verify(factory.CreateClient(), factory.Emails.LastToken(email, "verification"))).StatusCode);
        var pending = await client.GetAsync("/api/dashboard");
        Assert.Equal("account_pending_approval", await Code(pending));
        Assert.Equal("PendingApproval", (await Json(await client.GetAsync("/api/auth/me")))["status"]!.GetValue<string>());
    }

    [Fact]
    public async Task Valid_link_confirms_the_email_once()
    {
        var email = factory.NewEmail();
        await factory.RegisterAsync(email);
        var token = factory.Emails.LastToken(email, "verification");

        var ok = await Verify(factory.CreateClient(), token);   // works without being signed in
        Assert.Equal(HttpStatusCode.OK, ok.StatusCode);
        Assert.Equal("PendingApproval", (await Json(ok))["status"]!.GetValue<string>());
        var user = await UserAsync(email);
        Assert.True(user.EmailConfirmed);
        Assert.NotNull(user.EmailVerifiedAt);

        var reused = await Verify(factory.CreateClient(), token);
        Assert.Equal(HttpStatusCode.BadRequest, reused.StatusCode);
        Assert.Equal("token_used", await Code(reused));
    }

    [Fact]
    public async Task Expired_and_forged_links_are_refused()
    {
        var email = factory.NewEmail();
        await factory.RegisterAsync(email);
        var token = factory.Emails.LastToken(email, "verification");
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var hash = AccountTokenService.Hash(token);
            var row = await db.AccountTokens.SingleAsync(t => t.TokenHash == hash);
            row.ExpiresAt = DateTime.UtcNow.AddMinutes(-1);
            await db.SaveChangesAsync();
        }

        var expired = await Verify(factory.CreateClient(), token);
        Assert.Equal(HttpStatusCode.BadRequest, expired.StatusCode);
        Assert.Equal("token_expired", await Code(expired));
        Assert.Equal("invalid_token", await Code(await Verify(factory.CreateClient(), token[..^2] + "xx")));
        Assert.Equal(AccountStatus.PendingEmailVerification, (await UserAsync(email)).Status);
    }

    [Fact]
    public async Task A_reset_token_cannot_verify_an_email()
    {
        var email = factory.NewEmail();
        await factory.RegisterAsync(email);
        await factory.CreateClient().PostAsJsonAsync("/api/auth/forgot-password", new { email });

        var wrongPurpose = await Verify(factory.CreateClient(), factory.Emails.LastToken(email, "password-reset"));
        Assert.Equal("invalid_token", await Code(wrongPurpose));
    }

    [Fact]
    public async Task Resend_is_rate_limited_and_replaces_the_old_link()
    {
        var email = factory.NewEmail();
        var client = await factory.RegisterAsync(email);
        var first = factory.Emails.LastToken(email, "verification");

        var tooSoon = await client.PostAsync("/api/auth/resend-verification", null);
        Assert.Equal(HttpStatusCode.TooManyRequests, tooSoon.StatusCode);
        Assert.Equal("resend_too_soon", await Code(tooSoon));

        var userId = (await UserAsync(email)).Id;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.AccountTokens.Where(t => t.UserId == userId)
                .ExecuteUpdateAsync(s => s.SetProperty(t => t.CreatedAt, DateTime.UtcNow.AddMinutes(-2)));
        }
        Assert.Equal(HttpStatusCode.Accepted, (await client.PostAsync("/api/auth/resend-verification", null)).StatusCode);
        var second = factory.Emails.LastToken(email, "verification");
        Assert.NotEqual(first, second);

        Assert.Equal("token_used", await Code(await Verify(factory.CreateClient(), first)));
        Assert.Equal(HttpStatusCode.OK, (await Verify(factory.CreateClient(), second)).StatusCode);
        Assert.Equal("already_verified", await Code(await client.PostAsync("/api/auth/resend-verification", null)));
    }

    [Fact]
    public async Task A_failed_delivery_does_not_undo_the_sign_up()
    {
        var email = factory.NewEmail();
        HttpClient client;
        factory.Emails.Fail = true;
        try
        {
            client = await factory.RegisterAsync(email);   // sign-up still succeeds
        }
        finally
        {
            factory.Emails.Fail = false;
        }
        Assert.Empty(factory.Emails.To(email));
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/auth/me")).StatusCode);
    }

    [Theory]
    [InlineData(AccountStatus.Rejected, "account_rejected")]
    [InlineData(AccountStatus.Suspended, "account_suspended")]
    public async Task Rejected_and_suspended_accounts_cannot_sign_in_or_keep_using_a_session(AccountStatus status, string code)
    {
        var email = factory.NewEmail();
        var client = await factory.CreateUserClientAsync(email);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/dashboard")).StatusCode);

        await SetStatusAsync(email, status);
        var current = await client.GetAsync("/api/dashboard");   // takes effect on the next request, no new sign-in needed
        Assert.Equal(HttpStatusCode.Forbidden, current.StatusCode);
        Assert.Equal(code, await Code(current));

        var login = await factory.CreateClient().PostAsJsonAsync("/api/auth/login", new { email, password = ApiFactory.Password });
        Assert.Equal(HttpStatusCode.Forbidden, login.StatusCode);
        Assert.Equal(code, await Code(login));

        // Wrong password still gets the generic answer, so the status isn't revealed to someone guessing.
        var wrong = await factory.CreateClient().PostAsJsonAsync("/api/auth/login", new { email, password = "Wrong1234" });
        Assert.Equal("invalid_credentials", await Code(wrong));

        await factory.CreateClient().PostAsJsonAsync("/api/auth/forgot-password", new { email });
        Assert.Empty(factory.Emails.To(email, "password-reset"));
    }

    [Fact]
    public async Task Registering_or_verifying_the_owner_address_grants_nothing_and_a_reset_takes_it_over()
    {
        var isolated = new ApiFactory();
        await isolated.InitializeAsync();
        try
        {
            // Someone else registers the main administrator's address first, with their own password, and keeps the session.
            var squatter = await isolated.RegisterAsync(ApiFactory.OwnerEmail, "Squatter123");
            Assert.Equal("account_pending_verification", await Code(await squatter.GetAsync("/api/admin/overview")));

            // The real owner follows the verification link from their inbox: still nobody becomes owner.
            Assert.Equal(HttpStatusCode.OK, (await Verify(isolated.CreateClient(), isolated.Emails.LastToken(ApiFactory.OwnerEmail, "verification"))).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await squatter.GetAsync("/api/admin/overview")).StatusCode);
            var me = await Json(await squatter.GetAsync("/api/auth/me"));
            Assert.False(me["isOwner"]!.GetValue<bool>());
            Assert.False(me["isAdmin"]!.GetValue<bool>());
            var relogin = isolated.CreateClient();
            await relogin.PostAsJsonAsync("/api/auth/login", new { email = ApiFactory.OwnerEmail, password = "Squatter123" });
            Assert.Equal(HttpStatusCode.Forbidden, (await relogin.GetAsync("/api/admin/overview")).StatusCode);

            // The real owner resets the password from their inbox: they become owner, and the old sessions end at once.
            var owner = isolated.CreateClient();
            await owner.PostAsJsonAsync("/api/auth/forgot-password", new { email = ApiFactory.OwnerEmail });
            var reset = await owner.PostAsJsonAsync("/api/auth/reset-password",
                new { token = isolated.Emails.LastToken(ApiFactory.OwnerEmail, "password-reset"), newPassword = "RealOwner123" });
            Assert.Equal(HttpStatusCode.NoContent, reset.StatusCode);

            Assert.Equal(HttpStatusCode.Unauthorized, (await squatter.GetAsync("/api/admin/overview")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await squatter.GetAsync("/api/auth/me")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await relogin.GetAsync("/api/admin/overview")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await isolated.CreateClient().PostAsJsonAsync("/api/auth/login",
                new { email = ApiFactory.OwnerEmail, password = "Squatter123" })).StatusCode);

            Assert.Equal(HttpStatusCode.OK, (await owner.PostAsJsonAsync("/api/auth/login", new { email = ApiFactory.OwnerEmail, password = "RealOwner123" })).StatusCode);
            me = await Json(await owner.GetAsync("/api/auth/me"));
            Assert.Equal("Approved", me["status"]!.GetValue<string>());
            Assert.True(me["isOwner"]!.GetValue<bool>());
            Assert.Equal(HttpStatusCode.OK, (await owner.GetAsync("/api/admin/overview")).StatusCode);
        }
        finally
        {
            await ((IAsyncLifetime)isolated).DisposeAsync();
        }
    }

    [Fact]
    public async Task A_password_reset_ends_other_sessions_immediately()
    {
        var email = factory.NewEmail();
        var oldSession = await factory.CreateUserClientAsync(email);
        Assert.Equal(HttpStatusCode.OK, (await oldSession.GetAsync("/api/dashboard")).StatusCode);

        await factory.CreateClient().PostAsJsonAsync("/api/auth/forgot-password", new { email });
        await factory.CreateClient().PostAsJsonAsync("/api/auth/reset-password",
            new { token = factory.Emails.LastToken(email, "password-reset"), newPassword = "Changed456" });

        Assert.Equal(HttpStatusCode.Unauthorized, (await oldSession.GetAsync("/api/dashboard")).StatusCode);
    }

    [Fact]
    public async Task A_reset_link_also_confirms_the_address()
    {
        var email = factory.NewEmail();
        await factory.RegisterAsync(email);
        await factory.CreateClient().PostAsJsonAsync("/api/auth/forgot-password", new { email });
        await factory.CreateClient().PostAsJsonAsync("/api/auth/reset-password",
            new { token = factory.Emails.LastToken(email, "password-reset"), newPassword = "Changed456" });

        var user = await UserAsync(email);
        Assert.NotNull(user.EmailVerifiedAt);
        Assert.Equal(AccountStatus.PendingApproval, user.Status);
        Assert.False(user.IsOwner);
    }
}
