using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using DevPath.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>Challenges with points, submission history, the leaderboard and written tutorials, through the HTTP API.</summary>
public class ChallengeTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
    }

    private async Task<int> ExerciseIdAsync(string key)
    {
        using var scope = factory.Services.CreateScope();
        return await scope.ServiceProvider.GetRequiredService<AppDbContext>().PracticeExercises.Where(e => e.Key == key).Select(e => e.Id).SingleAsync();
    }

    private static Task<HttpResponseMessage> Submit(HttpClient client, int id, int passed, int total, string code) =>
        client.PostAsJsonAsync($"/api/practice/{id}/submissions", new { files = new[] { new { path = "Solution.cs", content = code } }, passed, total });

    [Fact]
    public async Task Challenges_are_the_exercises_with_checks_and_include_the_algorithm_domain()
    {
        var client = await factory.CreateUserClientAsync();
        var d = await Json(await client.GetAsync("/api/challenges"));
        var items = d["items"]!.AsArray();
        Assert.True(items.Count >= 60);
        Assert.Equal(14, items.Count(i => i!["domain"]!.GetValue<string>() == "Algorithms"));
        Assert.Equal(0, d["points"]!.GetValue<int>());
        Assert.Equal(items.Sum(i => i!["points"]!.GetValue<int>()), d["maxPoints"]!.GetValue<int>());
        var lru = items.Single(i => i!["key"]!.GetValue<string>() == "algo-lru-cache")!;
        Assert.Equal(60, lru["points"]!.GetValue<int>());
        var domains = d["domains"]!.AsArray().Select(x => x!["key"]!.GetValue<string>()).ToList();
        Assert.Equal("Algorithms", domains[0]);
        Assert.Contains("DataStructures", domains);
        Assert.Contains("Strings", domains);
        Assert.Contains("Math", domains);
        Assert.Contains("ObjectOriented", domains);
        Assert.Contains("Linq", domains);
        Assert.Equal(5, items.Count(i => i!["domain"]!.GetValue<string>() == "DataStructures"));
    }

    [Fact]
    public async Task Solving_a_challenge_earns_its_points_once_and_keeps_every_submission()
    {
        var client = await factory.CreateUserClientAsync();
        var id = await ExerciseIdAsync("algo-two-sum");

        (await Submit(client, id, 2, 5, "// first try")).EnsureSuccessStatusCode();
        var before = await Json(await client.GetAsync("/api/challenges"));
        Assert.Equal(0, before["points"]!.GetValue<int>());

        (await Submit(client, id, 5, 5, "// solved")).EnsureSuccessStatusCode();
        (await Submit(client, id, 5, 5, "// solved again")).EnsureSuccessStatusCode();
        var after = await Json(await client.GetAsync("/api/challenges"));
        Assert.Equal(10, after["points"]!.GetValue<int>());
        Assert.Equal(1, after["solved"]!.GetValue<int>());

        var history = (await Json(await client.GetAsync($"/api/practice/{id}/submissions"))).AsArray();
        Assert.Equal(3, history.Count);
        Assert.Equal(5, history[0]!["passed"]!.GetValue<int>());
        Assert.Equal(2, history[2]!["passed"]!.GetValue<int>());

        var first = await Json(await client.GetAsync($"/api/practice/submissions/{history[2]!["id"]!.GetValue<long>()}"));
        Assert.Equal("// first try", first["files"]!.AsArray()[0]!["content"]!.GetValue<string>());
    }

    [Fact]
    public async Task Only_the_latest_submissions_are_kept()
    {
        var client = await factory.CreateUserClientAsync();
        var id = await ExerciseIdAsync("algo-fizzbuzz");
        for (var i = 0; i < PracticeService.MaxSubmissionsKept + 3; i++)
            (await Submit(client, id, 1, 4, $"// try {i}")).EnsureSuccessStatusCode();
        var history = (await Json(await client.GetAsync($"/api/practice/{id}/submissions"))).AsArray();
        Assert.Equal(PracticeService.MaxSubmissionsKept, history.Count);
    }

    [Fact]
    public async Task Submissions_are_private_to_their_owner()
    {
        var a = await factory.CreateUserClientAsync();
        var b = await factory.CreateUserClientAsync();
        var id = await ExerciseIdAsync("algo-palindrome");
        (await Submit(a, id, 5, 5, "// a's code")).EnsureSuccessStatusCode();
        var mine = (await Json(await a.GetAsync($"/api/practice/{id}/submissions"))).AsArray();
        Assert.Empty((await Json(await b.GetAsync($"/api/practice/{id}/submissions"))).AsArray());
        Assert.Equal(HttpStatusCode.NotFound, (await b.GetAsync($"/api/practice/submissions/{mine[0]!["id"]!.GetValue<long>()}")).StatusCode);
    }

    [Fact]
    public async Task Leaderboard_ranks_learners_by_points_and_marks_the_caller()
    {
        var emailA = factory.NewEmail();
        var a = await factory.CreateUserClientAsync(emailA);
        var b = await factory.CreateUserClientAsync();
        (await Submit(a, await ExerciseIdAsync("algo-lru-cache"), 4, 4, "// a")).EnsureSuccessStatusCode();
        (await Submit(b, await ExerciseIdAsync("algo-reverse-words"), 4, 4, "// b")).EnsureSuccessStatusCode();

        var board = (await Json(await a.GetAsync("/api/challenges/leaderboard"))).AsArray();
        var me = board.Single(r => r!["isMe"]!.GetValue<bool>())!;
        Assert.Equal(60, me["points"]!.GetValue<int>());
        Assert.Equal("Test User", me["name"]!.GetValue<string>());
        Assert.DoesNotContain(emailA, board.ToJsonString());
        // Ranks follow points: nobody above the caller has fewer points.
        Assert.All(board.Where(r => r!["rank"]!.GetValue<int>() < me["rank"]!.GetValue<int>()), r => Assert.True(r!["points"]!.GetValue<int>() >= 60));
        Assert.Equal(1, (await Json(await b.GetAsync("/api/challenges/leaderboard"))).AsArray().Count(r => r!["isMe"]!.GetValue<bool>()));
    }

    [Fact]
    public async Task A_topic_with_a_tutorial_returns_its_lessons_in_order_and_others_return_none()
    {
        var client = await factory.CreateUserClientAsync();
        int withTutorial, without;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            withTutorial = await db.Topics.Where(t => t.Slug == "cs-loops").Select(t => t.Id).SingleAsync();
            without = await db.Topics.Where(t => t.Slug == "ng-signals").Select(t => t.Id).SingleAsync();
        }
        var lessons = (await Json(await client.GetAsync($"/api/topics/{withTutorial}/lessons"))).AsArray();
        Assert.Equal(4, lessons.Count);
        Assert.Equal(new[] { 1, 2, 3, 4 }, lessons.Select(l => l!["order"]!.GetValue<int>()));
        Assert.Equal("The for loop", lessons[0]!["titleEn"]!.GetValue<string>());
        Assert.False(string.IsNullOrWhiteSpace(lessons[0]!["bodyAr"]!.GetValue<string>()));
        Assert.Contains("Round 1", lessons[0]!["output"]!.GetValue<string>());

        Assert.Empty((await Json(await client.GetAsync($"/api/topics/{without}/lessons"))).AsArray());
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/topics/999999/lessons")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await factory.CreateClient().GetAsync($"/api/topics/{withTutorial}/lessons")).StatusCode);
    }
}
