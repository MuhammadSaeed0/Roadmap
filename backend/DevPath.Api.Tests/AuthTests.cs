using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>Sign-up, sign-in, sessions, sign-out and password recovery over real HTTP.</summary>
public class AuthTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response) =>
        JsonNode.Parse(await response.Content.ReadAsStringAsync())!;

    private static string NewEmail() => $"auth-{Guid.NewGuid():N}@example.com";

    private static Task<HttpResponseMessage> Register(HttpClient client, string email, string password = ApiFactory.Password, string fullName = "Sara Ali") =>
        client.PostAsJsonAsync("/api/auth/register", new { fullName, email, password });

    private static Task<HttpResponseMessage> Login(HttpClient client, string email, string password = ApiFactory.Password) =>
        client.PostAsJsonAsync("/api/auth/login", new { email, password });

    [Theory]
    [InlineData("/api/dashboard")]
    [InlineData("/api/roadmap")]
    [InlineData("/api/topics/1")]
    [InlineData("/api/notes")]
    [InlineData("/api/topics/1/videos")]
    [InlineData("/api/auth/me")]
    public async Task Protected_endpoints_return_401_problem_without_a_session(string url)
    {
        var response = await factory.CreateClient().GetAsync(url);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("unauthenticated", (await Json(response))["code"]!.GetValue<string>());
    }

    [Fact]
    public async Task Writes_without_a_session_are_rejected()
    {
        var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/notes", new { title = "x" })).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PutAsJsonAsync("/api/topics/1/progress",
            new { status = "Completed", knowledge = "Unassessed" })).StatusCode);
    }

    [Fact]
    public async Task Health_check_stays_public()
    {
        Assert.Equal(HttpStatusCode.OK, (await factory.CreateClient().GetAsync("/api/health")).StatusCode);
    }

    [Fact]
    public async Task Sign_up_signs_in_and_stores_a_password_hash_not_the_password()
    {
        var client = factory.CreateClient();
        var email = NewEmail();
        var response = await Register(client, email);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), c => c.StartsWith("devpath.auth=") && c.Contains("httponly", StringComparison.OrdinalIgnoreCase));

        var me = await Json(await client.GetAsync("/api/auth/me"));
        Assert.Equal(email, me["email"]!.GetValue<string>());
        Assert.Equal("Sara Ali", me["fullName"]!.GetValue<string>());
        Assert.Equal("PendingEmailVerification", me["status"]!.GetValue<string>());
        Assert.False(me["isAdmin"]!.GetValue<bool>());

        using var scope = factory.Services.CreateScope();
        var user = await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users.SingleAsync(u => u.Email == email);
        Assert.NotNull(user.PasswordHash);
        Assert.DoesNotContain(ApiFactory.Password, user.PasswordHash);
    }

    [Fact]
    public async Task Duplicate_email_is_rejected_case_insensitively()
    {
        var email = NewEmail();
        Assert.Equal(HttpStatusCode.Created, (await Register(factory.CreateClient(), email)).StatusCode);

        var again = await Register(factory.CreateClient(), email.ToUpperInvariant());
        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);
        Assert.Equal("email_taken", (await Json(again))["code"]!.GetValue<string>());
    }

    [Theory]
    [InlineData("short1")]       // too short
    [InlineData("onlyletters")]  // no digit
    [InlineData("1234567890")]   // no letter
    public async Task Weak_passwords_are_rejected(string password)
    {
        var response = await Register(factory.CreateClient(), NewEmail(), password);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var code = (await Json(response))["code"]!.GetValue<string>();
        Assert.Contains(code, new[] { "weak_password", "validation_failed" });
    }

    [Fact]
    public async Task Sign_up_validates_name_and_email()
    {
        Assert.Equal(HttpStatusCode.BadRequest, (await Register(factory.CreateClient(), "not-an-email")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Register(factory.CreateClient(), NewEmail(), fullName: "   ")).StatusCode);
    }

    [Fact]
    public async Task Existing_user_can_sign_in_and_wrong_password_gets_the_same_error_as_unknown_email()
    {
        var email = NewEmail();
        await Register(factory.CreateClient(), email);
        await factory.ApproveInDatabaseAsync(email);

        var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await Login(client, email)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/dashboard")).StatusCode);

        var wrongPassword = await Login(factory.CreateClient(), email, "Wrong1234");
        var unknownEmail = await Login(factory.CreateClient(), NewEmail());
        Assert.Equal(HttpStatusCode.Unauthorized, wrongPassword.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, unknownEmail.StatusCode);
        Assert.Equal("invalid_credentials", (await Json(wrongPassword))["code"]!.GetValue<string>());
        Assert.Equal("invalid_credentials", (await Json(unknownEmail))["code"]!.GetValue<string>());
    }

    [Fact]
    public async Task Account_locks_after_repeated_wrong_passwords()
    {
        var email = NewEmail();
        await Register(factory.CreateClient(), email);
        for (var i = 0; i < 5; i++) await Login(factory.CreateClient(), email, "Wrong1234");

        var locked = await Login(factory.CreateClient(), email);   // even the right password is refused while locked
        Assert.Equal((HttpStatusCode)423, locked.StatusCode);
        Assert.Equal("locked_out", (await Json(locked))["code"]!.GetValue<string>());
    }

    [Fact]
    public async Task Sign_out_ends_the_session()
    {
        var client = await factory.CreateUserClientAsync();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/auth/me")).StatusCode);

        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync("/api/auth/logout", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/auth/me")).StatusCode);
    }

    [Fact]
    public async Task Session_cookie_survives_a_new_client_like_a_page_refresh()
    {
        var first = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var register = await Register(first, NewEmail());
        var cookie = register.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("devpath.auth=")).Split(';')[0];

        var second = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        second.DefaultRequestHeaders.Add("Cookie", cookie);
        Assert.Equal(HttpStatusCode.OK, (await second.GetAsync("/api/auth/me")).StatusCode);

        var tampered = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        tampered.DefaultRequestHeaders.Add("Cookie", cookie[..^4] + "AAAA");
        Assert.Equal(HttpStatusCode.Unauthorized, (await tampered.GetAsync("/api/auth/me")).StatusCode);
    }

    [Fact]
    public async Task Forgot_password_does_not_reveal_accounts_and_the_link_resets_the_password_once()
    {
        var email = NewEmail();
        await Register(factory.CreateClient(), email);

        var anon = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Accepted, (await anon.PostAsJsonAsync("/api/auth/forgot-password", new { email = NewEmail() })).StatusCode);
        Assert.Equal(HttpStatusCode.Accepted, (await anon.PostAsJsonAsync("/api/auth/forgot-password", new { email })).StatusCode);

        var link = new Uri(factory.Emails.To(email, "password-reset").Single().Link!);
        Assert.Equal("https://devpath.test/reset-password", link.GetLeftPart(UriPartial.Path));
        var token = factory.Emails.LastToken(email, "password-reset");

        var weak = await anon.PostAsJsonAsync("/api/auth/reset-password", new { token, newPassword = "onlyletters" });
        Assert.Equal(HttpStatusCode.BadRequest, weak.StatusCode);   // a weak choice doesn't use up the link

        var reset = await anon.PostAsJsonAsync("/api/auth/reset-password", new { token, newPassword = "NewSecret456" });
        Assert.Equal(HttpStatusCode.NoContent, reset.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Login(factory.CreateClient(), email)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Login(factory.CreateClient(), email, "NewSecret456")).StatusCode);

        var reused = await anon.PostAsJsonAsync("/api/auth/reset-password", new { token, newPassword = "Another789" });
        Assert.Equal(HttpStatusCode.BadRequest, reused.StatusCode);
        Assert.Equal("token_used", (await Json(reused))["code"]!.GetValue<string>());

        var forged = await anon.PostAsJsonAsync("/api/auth/reset-password", new { token = "not-a-real-token", newPassword = "Another789" });
        Assert.Equal("invalid_token", (await Json(forged))["code"]!.GetValue<string>());
    }

    [Fact]
    public async Task Change_password_requires_the_current_one()
    {
        var email = NewEmail();
        var client = factory.CreateClient();
        await Register(client, email);

        var wrong = await client.PostAsJsonAsync("/api/auth/change-password", new { currentPassword = "Nope12345", newPassword = "Changed123" });
        Assert.Equal(HttpStatusCode.BadRequest, wrong.StatusCode);
        Assert.Equal("wrong_password", (await Json(wrong))["code"]!.GetValue<string>());

        var ok = await client.PostAsJsonAsync("/api/auth/change-password", new { currentPassword = ApiFactory.Password, newPassword = "Changed123" });
        Assert.Equal(HttpStatusCode.NoContent, ok.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/api/auth/me")).StatusCode);   // this device stays signed in
        Assert.Equal(HttpStatusCode.OK, (await Login(factory.CreateClient(), email, "Changed123")).StatusCode);
    }
}

/// <summary>Uses its own API host so the low attempt limit doesn't affect other tests.</summary>
public class AuthRateLimitTests : IAsyncLifetime
{
    private readonly ApiFactory _factory = new();

    public Task InitializeAsync() => _factory.InitializeAsync();
    public async Task DisposeAsync() => await ((IAsyncLifetime)_factory).DisposeAsync();

    [Fact]
    public async Task Too_many_sign_in_attempts_get_429()
    {
        using var factory = _factory.WithWebHostBuilder(b => b.ConfigureAppConfiguration((_, c) =>
            c.AddInMemoryCollection(new Dictionary<string, string?> { ["Auth:AttemptsPerMinute"] = "3" })));
        var client = factory.CreateClient();
        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 5; i++)
            statuses.Add((await client.PostAsJsonAsync("/api/auth/login", new { email = "nobody@example.com", password = "Wrong1234" })).StatusCode);

        Assert.Equal(HttpStatusCode.TooManyRequests, statuses[^1]);
        Assert.Equal(3, statuses.Count(s => s == HttpStatusCode.Unauthorized));
    }
}
