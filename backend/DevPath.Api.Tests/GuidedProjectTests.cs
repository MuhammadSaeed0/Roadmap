using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;

namespace DevPath.Api.Tests;

/// <summary>The Project library: seeded projects with steps, and each learner's own step progress.</summary>
public class GuidedProjectTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Lists_projects_at_three_levels_with_steps_and_hints()
    {
        var client = await factory.CreateUserClientAsync();
        var list = (await client.GetFromJsonAsync<JsonArray>("/api/guided-projects"))!;
        Assert.NotEmpty(list);
        var levels = list.Select(p => p!["level"]!.GetValue<string>()).Distinct().ToList();
        Assert.Equal(["Beginner", "Intermediate", "Advanced"], levels.Order(Comparer<string>.Create((a, b) => Rank(a) - Rank(b))));

        var id = list[0]!["id"]!.GetValue<int>();
        var detail = (await client.GetFromJsonAsync<JsonObject>($"/api/guided-projects/{id}"))!;
        var steps = detail["steps"]!.AsArray();
        Assert.True(steps.Count >= 6);
        Assert.All(steps, s => Assert.NotEmpty(s!["hintsEn"]!.AsArray()));
        Assert.Equal(steps.Select(s => s!["order"]!.GetValue<int>()), Enumerable.Range(1, steps.Count));
        Assert.NotEmpty(detail["acceptanceAr"]!.AsArray());

        static int Rank(string level) => level switch { "Beginner" => 0, "Intermediate" => 1, _ => 2 };
    }

    [Fact]
    public async Task Every_skill_has_two_projects_at_each_level()
    {
        var client = await factory.CreateUserClientAsync();
        var list = (await client.GetFromJsonAsync<JsonArray>("/api/guided-projects"))!;
        var groups = list.GroupBy(p => (Skill: p!["skill"]!.GetValue<string>(), Level: p["level"]!.GetValue<string>())).ToList();
        Assert.Equal(11 * 3, groups.Count);
        Assert.All(groups, g => Assert.Equal(2, g.Count()));
    }

    [Fact]
    public async Task Steps_are_ticked_per_learner()
    {
        var me = await factory.CreateUserClientAsync();
        var other = await factory.CreateUserClientAsync();
        var project = (await me.GetFromJsonAsync<JsonArray>("/api/guided-projects"))![0]!;
        var id = project["id"]!.GetValue<int>();
        var step = (await me.GetFromJsonAsync<JsonObject>($"/api/guided-projects/{id}"))!["steps"]![0]!;
        var stepId = step["id"]!.GetValue<int>();

        Assert.Equal(HttpStatusCode.NoContent, (await me.PutAsJsonAsync($"/api/guided-projects/{id}/steps/{stepId}", new { done = true })).StatusCode);
        // Setting the same state twice is harmless.
        Assert.Equal(HttpStatusCode.NoContent, (await me.PutAsJsonAsync($"/api/guided-projects/{id}/steps/{stepId}", new { done = true })).StatusCode);

        var mine = (await me.GetFromJsonAsync<JsonArray>("/api/guided-projects"))!.Single(p => p!["id"]!.GetValue<int>() == id)!;
        var theirs = (await other.GetFromJsonAsync<JsonArray>("/api/guided-projects"))!.Single(p => p!["id"]!.GetValue<int>() == id)!;
        Assert.Equal(1, mine["doneSteps"]!.GetValue<int>());
        Assert.Equal(0, theirs["doneSteps"]!.GetValue<int>());
        Assert.True((await me.GetFromJsonAsync<JsonObject>($"/api/guided-projects/{id}"))!["steps"]![0]!["done"]!.GetValue<bool>());

        await me.PutAsJsonAsync($"/api/guided-projects/{id}/steps/{stepId}", new { done = false });
        Assert.False((await me.GetFromJsonAsync<JsonObject>($"/api/guided-projects/{id}"))!["steps"]![0]!["done"]!.GetValue<bool>());

        // A step of another project is not found under this one.
        var otherProject = (await me.GetFromJsonAsync<JsonArray>("/api/guided-projects"))![1]!["id"]!.GetValue<int>();
        Assert.Equal(HttpStatusCode.NotFound, (await me.PutAsJsonAsync($"/api/guided-projects/{otherProject}/steps/{stepId}", new { done = true })).StatusCode);
    }
}
