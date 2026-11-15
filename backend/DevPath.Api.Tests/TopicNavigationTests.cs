using System.Net.Http.Json;
using System.Text.Json.Nodes;

namespace DevPath.Api.Tests;

/// <summary>A topic page links to the topics before and after it across the whole roadmap.</summary>
public class TopicNavigationTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Previous_and_next_follow_the_roadmap_across_phases()
    {
        var client = await factory.CreateUserClientAsync();
        var roadmap = await client.GetFromJsonAsync<JsonObject>("/api/roadmap");
        var phases = roadmap!["phases"]!.AsArray().Where(p => p!["topics"]!.AsArray().Count > 0).ToList();
        var first = phases[0]!["topics"]!.AsArray();
        var second = phases[1]!["topics"]!.AsArray();
        int Id(JsonNode? n) => n!["id"]!.GetValue<int>();

        var start = await client.GetFromJsonAsync<JsonObject>($"/api/topics/{Id(first[0])}");
        Assert.Null(start!["previous"]);
        Assert.Equal(Id(first[1]), Id(start["next"]));

        // The last topic of a phase leads to the first topic of the next phase, and back.
        var end = await client.GetFromJsonAsync<JsonObject>($"/api/topics/{Id(first[^1])}");
        Assert.Equal(Id(first[^2]), Id(end!["previous"]));
        Assert.Equal(Id(second[0]), Id(end["next"]));
        var next = await client.GetFromJsonAsync<JsonObject>($"/api/topics/{Id(second[0])}");
        Assert.Equal(Id(first[^1]), Id(next!["previous"]));
    }
}
