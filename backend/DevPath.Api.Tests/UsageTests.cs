using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Services;

namespace DevPath.Api.Tests;

/// <summary>Usage statistics: route patterns and daily counts only, readable by administrators only.</summary>
public class UsageTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
    }

    [Theory]
    [InlineData("", true)]
    [InlineData("topics/:id", true)]
    [InlineData("project-library/:id", true)]
    [InlineData("u/:handle", true)]
    [InlineData("topics/12", false)]           // an id from the URL
    [InlineData("/topics/:id", false)]
    [InlineData("topics/:id?tab=x", false)]
    [InlineData("u/someone@example.com", false)]
    [InlineData("Topics", false)]
    public void Only_route_patterns_are_accepted(string route, bool valid) => Assert.Equal(valid, UsageService.IsValidRoute(route));

    [Fact]
    public async Task Page_views_are_counted_per_route_and_shown_to_admins_only()
    {
        var route = "usage-test-" + Guid.NewGuid().ToString("N")[..8];
        var learner = await factory.CreateUserClientAsync();
        var anonymous = factory.CreateClient();

        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.PostAsJsonAsync("/api/usage/page-views", new { route })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await learner.PostAsJsonAsync("/api/usage/page-views", new { route = "topics/42" })).StatusCode);
        for (var i = 0; i < 3; i++)
            Assert.Equal(HttpStatusCode.NoContent, (await learner.PostAsJsonAsync("/api/usage/page-views", new { route })).StatusCode);
        // Sequential on purpose: the test server shares one in-memory SQLite connection between requests, so
        // parallel writes would share a transaction. SQL Server gives each request its own connection.
        for (var i = 0; i < 5; i++)
            (await learner.PostAsJsonAsync("/api/usage/page-views", new { route = route + "/:id" })).EnsureSuccessStatusCode();

        Assert.Equal(HttpStatusCode.Forbidden, (await learner.GetAsync("/api/admin/usage")).StatusCode);

        var (admin, _) = await factory.CreateAdminClientAsync();
        // The default window is the last 60 days, today included.
        var report = await Json(await admin.GetAsync("/api/admin/usage"));
        var pages = report["topPages"]!.AsArray();
        Assert.Equal(3, pages.Single(p => p!["route"]!.GetValue<string>() == route)!["views"]!.GetValue<int>());
        Assert.Equal(5, pages.Single(p => p!["route"]!.GetValue<string>() == route + "/:id")!["views"]!.GetValue<int>());
        Assert.Equal(60, report["daily"]!.AsArray().Count);
        Assert.Equal(DateOnly.Parse(report["to"]!.GetValue<string>()).AddDays(-59), DateOnly.Parse(report["from"]!.GetValue<string>()));
        Assert.True(report["daily"]!.AsArray()[^1]!["views"]!.GetValue<int>() >= 8);
        // Counts only: nothing that names a person.
        var text = report.ToJsonString();
        Assert.DoesNotContain("@", text);
        Assert.DoesNotContain("userId", text, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Library_uptake_counts_learners_who_started_and_finished()
    {
        var (admin, _) = await factory.CreateAdminClientAsync();
        var before = (await Json(await admin.GetAsync("/api/admin/usage")))["library"]!;

        var starter = await factory.CreateUserClientAsync();
        var finisher = await factory.CreateUserClientAsync();
        var project = (await starter.GetFromJsonAsync<JsonArray>("/api/guided-projects"))![0]!;
        var id = project["id"]!.GetValue<int>();
        var steps = (await starter.GetFromJsonAsync<JsonObject>($"/api/guided-projects/{id}"))!["steps"]!.AsArray();
        (await starter.PutAsJsonAsync($"/api/guided-projects/{id}/steps/{steps[0]!["id"]}", new { done = true })).EnsureSuccessStatusCode();
        foreach (var step in steps)
            (await finisher.PutAsJsonAsync($"/api/guided-projects/{id}/steps/{step!["id"]}", new { done = true })).EnsureSuccessStatusCode();

        var after = (await Json(await admin.GetAsync("/api/admin/usage")))["library"]!;
        Assert.Equal(before["learnersStarted"]!.GetValue<int>() + 2, after["learnersStarted"]!.GetValue<int>());
        Assert.Equal(before["learnersFinished"]!.GetValue<int>() + 1, after["learnersFinished"]!.GetValue<int>());
        Assert.Equal(before["projectsFinished"]!.GetValue<int>() + 1, after["projectsFinished"]!.GetValue<int>());
    }

    [Theory]
    [InlineData(null, "direct")]
    [InlineData("", "direct")]
    [InlineData(" Facebook ", "facebook")]
    [InlineData("reddit", "reddit")]
    [InlineData("someone@example.com", "other")]
    [InlineData("<script>", "other")]
    public void Sources_come_from_a_fixed_list(string? source, string expected) => Assert.Equal(expected, UsageService.NormalizeSource(source));

    [Fact]
    public async Task Guest_visits_and_sign_ups_are_counted_per_source_without_an_account()
    {
        var (admin, _) = await factory.CreateAdminClientAsync();
        async Task<(int Visits, int SignUps)> Linkedin()
        {
            var row = (await Json(await admin.GetAsync("/api/admin/usage")))["sources"]!.AsArray()
                .SingleOrDefault(s => s!["source"]!.GetValue<string>() == "linkedin");
            return row is null ? (0, 0) : (row["visits"]!.GetValue<int>(), row["signUps"]!.GetValue<int>());
        }
        var before = await Linkedin();

        var guest = factory.CreateClient();
        for (var i = 0; i < 2; i++)
            Assert.Equal(HttpStatusCode.NoContent, (await guest.PostAsJsonAsync("/api/usage/visits", new { source = "linkedin" })).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await factory.CreateClient().PostAsJsonAsync("/api/auth/register",
            new { fullName = "Source Test", email = $"src-{Guid.NewGuid():N}@example.com", password = "Passw0rd!x", source = "linkedin" })).StatusCode);

        var after = await Linkedin();
        Assert.Equal(before.Visits + 2, after.Visits);
        Assert.Equal(before.SignUps + 1, after.SignUps);
        // An unknown source is stored as "other", never as the text that was sent.
        (await guest.PostAsJsonAsync("/api/usage/visits", new { source = "my-secret-campaign" })).EnsureSuccessStatusCode();
        Assert.DoesNotContain("my-secret-campaign", (await Json(await admin.GetAsync("/api/admin/usage"))).ToJsonString());
    }
}
