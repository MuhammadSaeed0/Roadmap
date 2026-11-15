using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

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

    private static async Task<JsonNode> Json(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
    }

    [Fact]
    public async Task Every_project_practises_seeded_topics_and_topic_pages_suggest_it()
    {
        int topicId, projectId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            Assert.Equal(await db.GuidedProjects.CountAsync(), await db.GuidedProjectTopics.Select(l => l.ProjectId).Distinct().CountAsync());
            var link = await db.GuidedProjectTopics.OrderBy(l => l.ProjectId).FirstAsync();
            (topicId, projectId) = (link.TopicId, link.ProjectId);
        }
        var client = await factory.CreateUserClientAsync();
        var topic = await Json(await client.GetAsync($"/api/topics/{topicId}"));
        Assert.Contains(topic["guidedProjects"]!.AsArray(), g => g!["id"]!.GetValue<int>() == projectId);
    }

    [Fact]
    public async Task Finishing_a_project_feeds_the_dashboard_xp_cv_and_public_profile()
    {
        var client = await factory.CreateUserClientAsync();
        var anonymous = factory.CreateClient();
        Assert.Equal(HttpStatusCode.NoContent, (await client.GetAsync("/api/guided-projects/current")).StatusCode);

        var list = (await client.GetFromJsonAsync<JsonArray>("/api/guided-projects"))!;
        var project = list.First(p => p!["level"]!.GetValue<string>() == "Beginner")!;
        var id = project["id"]!.GetValue<int>();
        var steps = (await client.GetFromJsonAsync<JsonObject>($"/api/guided-projects/{id}"))!["steps"]!.AsArray();

        // One step done: it is the current project and the next step is the second one.
        (await client.PutAsJsonAsync($"/api/guided-projects/{id}/steps/{steps[0]!["id"]}", new { done = true })).EnsureSuccessStatusCode();
        var current = await Json(await client.GetAsync("/api/guided-projects/current"));
        Assert.Equal(id, current["id"]!.GetValue<int>());
        Assert.Equal(steps[1]!["titleEn"]!.GetValue<string>(), current["nextStepTitleEn"]!.GetValue<string>());
        await Json(await client.GetAsync("/api/skill-level"));
        Assert.DoesNotContain("guided-project", (await client.GetStringAsync("/api/skill-level/history?pageSize=100")));

        foreach (var step in steps.Skip(1))
            (await client.PutAsJsonAsync($"/api/guided-projects/{id}/steps/{step!["id"]}", new { done = true })).EnsureSuccessStatusCode();
        // Finished projects are no longer "current".
        Assert.Equal(HttpStatusCode.NoContent, (await client.GetAsync("/api/guided-projects/current")).StatusCode);

        // XP once, self-reported, and asking again does not add it twice.
        await Json(await client.GetAsync("/api/skill-level"));
        await Json(await client.GetAsync("/api/skill-level"));
        var history = (await Json(await client.GetAsync("/api/skill-level/history?pageSize=100")))["items"]!.AsArray();
        var earned = history.Where(h => h!["activity"]!.GetValue<string>() == "GuidedProjectCompleted").ToList();
        Assert.Single(earned);
        Assert.Equal("SelfReported", earned[0]!["verification"]!.GetValue<string>());

        // A repository link makes it evidenced; a bad link is refused.
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PutAsJsonAsync($"/api/guided-projects/{id}/repository", new { repositoryUrl = "not a url" })).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PutAsJsonAsync($"/api/guided-projects/{id}/repository", new { repositoryUrl = "https://github.com/me/lib-project" })).StatusCode);
        Assert.Equal("https://github.com/me/lib-project", (await client.GetFromJsonAsync<JsonObject>($"/api/guided-projects/{id}"))!["repositoryUrl"]!.GetValue<string>());
        await Json(await client.GetAsync("/api/skill-level"));
        history = (await Json(await client.GetAsync("/api/skill-level/history?pageSize=100")))["items"]!.AsArray();
        Assert.Contains(history, h => h!["activity"]!.GetValue<string>() == "GuidedProjectCompleted" && h["verification"]!.GetValue<string>() == "Evidenced");

        // CV suggestions list it as built.
        var cv = await Json(await client.GetAsync("/api/cv/suggestions"));
        var key = "guided:" + project["key"]!.GetValue<string>();
        var suggestion = cv["projects"]!.AsArray().Single(p => p!["key"]!.GetValue<string>() == key)!;
        Assert.Equal("built", suggestion["evidence"]!["level"]!.GetValue<string>());

        // The public profile shows it; another learner's profile does not.
        var handle = $"lib-{Guid.NewGuid():N}"[..20];
        await Json(await client.PutAsJsonAsync("/api/profile", new { isPublic = true, handle }));
        var profile = await Json(await anonymous.GetAsync($"/api/profiles/{handle}"));
        var shown = profile["libraryProjects"]!.AsArray().Single()!;
        Assert.Equal(id, shown["id"]!.GetValue<int>());
        Assert.Equal("https://github.com/me/lib-project", shown["repositoryUrl"]!.GetValue<string>());

        var other = await factory.CreateUserClientAsync();
        var otherHandle = $"lib-{Guid.NewGuid():N}"[..20];
        await Json(await other.PutAsJsonAsync("/api/profile", new { isPublic = true, handle = otherHandle }));
        Assert.Empty((await Json(await anonymous.GetAsync($"/api/profiles/{otherHandle}")))["libraryProjects"]!.AsArray());
    }
}
