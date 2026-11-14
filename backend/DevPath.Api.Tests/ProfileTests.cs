using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;

namespace DevPath.Api.Tests;

/// <summary>Public profiles: off by default, opt-in with a unique handle, readable without signing in, never leaking the email.</summary>
public class ProfileTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
    }

    private static string Handle() => $"dev-{Guid.NewGuid():N}"[..20];

    [Fact]
    public async Task A_profile_is_private_until_its_owner_publishes_it()
    {
        var email = factory.NewEmail();
        var owner = await factory.CreateUserClientAsync(email);
        var anonymous = factory.CreateClient();
        var handle = Handle();

        var settings = await Json(await owner.GetAsync("/api/profile"));
        Assert.False(settings["isPublic"]!.GetValue<bool>());

        // A handle alone doesn't publish anything.
        await Json(await owner.PutAsJsonAsync("/api/profile", new { isPublic = false, handle }));
        Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync($"/api/profiles/{handle}")).StatusCode);

        await Json(await owner.PutAsJsonAsync("/api/profile", new { isPublic = true, handle }));
        var response = await anonymous.GetAsync($"/api/profiles/{handle.ToUpperInvariant()}");
        var body = await response.Content.ReadAsStringAsync();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var profile = JsonNode.Parse(body)!;
        Assert.Equal(handle, profile["handle"]!.GetValue<string>());
        Assert.Equal("Test User", profile["name"]!.GetValue<string>());
        Assert.DoesNotContain(email, body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("@", body);

        await Json(await owner.PutAsJsonAsync("/api/profile", new { isPublic = false, handle }));
        Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync($"/api/profiles/{handle}")).StatusCode);
    }

    [Fact]
    public async Task Handles_must_be_valid_and_unique()
    {
        var a = await factory.CreateUserClientAsync();
        var b = await factory.CreateUserClientAsync();
        var handle = Handle();

        foreach (var bad in new[] { "ab", "-starts-with-hyphen", "has space", "double--hyphen", "UPPER_case!", new string('a', 31) })
            Assert.Equal(HttpStatusCode.BadRequest, (await a.PutAsJsonAsync("/api/profile", new { isPublic = false, handle = bad })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await a.PutAsJsonAsync("/api/profile", new { isPublic = true, handle = (string?)null })).StatusCode);

        await Json(await a.PutAsJsonAsync("/api/profile", new { isPublic = true, handle }));
        Assert.Equal(HttpStatusCode.Conflict, (await b.PutAsJsonAsync("/api/profile", new { isPublic = true, handle })).StatusCode);
    }

    [Fact]
    public async Task The_profile_shows_progress_from_the_owners_own_records()
    {
        var owner = await factory.CreateUserClientAsync();
        var other = await factory.CreateUserClientAsync();
        var handle = Handle();
        (await owner.PutAsJsonAsync("/api/topics/1/progress", new { status = "Completed", knowledge = "AlreadyKnow", confidence = 4 })).EnsureSuccessStatusCode();
        (await other.PutAsJsonAsync("/api/topics/2/progress", new { status = "Completed", knowledge = "AlreadyKnow", confidence = 4 })).EnsureSuccessStatusCode();
        await Json(await owner.PutAsJsonAsync("/api/profile", new { isPublic = true, handle }));

        var profile = await Json(await other.GetAsync($"/api/profiles/{handle}"));
        Assert.Equal(1, profile["topicsCompleted"]!.GetValue<int>());
        Assert.Contains(profile["paths"]!.AsArray(), p => p!["percent"]!.GetValue<double>() > 0);
    }
}
