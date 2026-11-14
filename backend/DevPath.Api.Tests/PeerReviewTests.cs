using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;

namespace DevPath.Api.Tests;

/// <summary>Peer review of finished projects: who may ask, who may review, and what it is worth.</summary>
public class PeerReviewTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const int ProjectId = 1;

    private static async Task<JsonNode> Json(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
    }

    private static async Task<string?> Code(HttpResponseMessage response) =>
        JsonNode.Parse(await response.Content.ReadAsStringAsync())?["code"]?.GetValue<string>();

    /// <summary>Completes every required task of project 1 (change requests aside) and links a repository.</summary>
    private static async Task FinishProjectAsync(HttpClient client, bool withRepository = true)
    {
        var project = await Json(await client.GetAsync($"/api/projects/{ProjectId}"));
        foreach (var task in project["milestones"]!.AsArray().SelectMany(m => m!["tasks"]!.AsArray()))
            (await client.PutAsJsonAsync($"/api/project-tasks/{task!["id"]!.GetValue<int>()}/progress", new { status = "Completed" })).EnsureSuccessStatusCode();
        if (withRepository)
            (await client.PutAsJsonAsync($"/api/projects/{ProjectId}/repository", new { repositoryUrl = "https://github.com/learner/inventory" })).EnsureSuccessStatusCode();
    }

    private static async Task<Dictionary<string, int>> AllScores(HttpClient client, int value)
    {
        var lists = await Json(await client.GetAsync("/api/review-requests"));
        return lists["criteria"]!.AsArray().ToDictionary(c => c!.GetValue<string>(), _ => value);
    }

    private static async Task<int> XpOf(HttpClient client, Func<string, bool> sourceKey)
    {
        (await client.GetAsync("/api/skill-level")).EnsureSuccessStatusCode();
        var items = (await Json(await client.GetAsync("/api/skill-level/history?pageSize=100")))["items"]!.AsArray();
        return items.Where(i => sourceKey(i!["sourceKey"]!.GetValue<string>())).Sum(i => i!["points"]!.GetValue<int>());
    }

    [Fact]
    public async Task Asking_for_a_review_needs_a_finished_project_and_a_repository()
    {
        var learner = await factory.CreateUserClientAsync();
        Assert.Equal("project_not_finished", await Code(await learner.PostAsync($"/api/projects/{ProjectId}/review-request", null)));

        await FinishProjectAsync(learner, withRepository: false);
        Assert.Equal("repository_required", await Code(await learner.PostAsync($"/api/projects/{ProjectId}/review-request", null)));

        (await learner.PutAsJsonAsync($"/api/projects/{ProjectId}/repository", new { repositoryUrl = "https://github.com/learner/inventory" })).EnsureSuccessStatusCode();
        var request = await Json(await learner.PostAsync($"/api/projects/{ProjectId}/review-request", null));
        Assert.Equal("Open", request["status"]!.GetValue<string>());
        Assert.Equal("review_pending", await Code(await learner.PostAsync($"/api/projects/{ProjectId}/review-request", null)));
    }

    [Fact]
    public async Task Only_someone_who_finished_the_same_project_can_claim_and_nobody_reviews_themselves()
    {
        var requester = await factory.CreateUserClientAsync();
        await FinishProjectAsync(requester);
        var id = (await Json(await requester.PostAsync($"/api/projects/{ProjectId}/review-request", null)))["id"]!.GetValue<int>();

        Assert.Equal("own_review", await Code(await requester.PostAsync($"/api/review-requests/{id}/claim", null)));

        var newcomer = await factory.CreateUserClientAsync();
        Assert.DoesNotContain((await Json(await newcomer.GetAsync("/api/review-requests")))["open"]!.AsArray(), r => r!["id"]!.GetValue<int>() == id);
        Assert.Equal("project_not_finished", await Code(await newcomer.PostAsync($"/api/review-requests/{id}/claim", null)));

        var reviewer = await factory.CreateUserClientAsync();
        var rival = await factory.CreateUserClientAsync();
        await FinishProjectAsync(reviewer);
        await FinishProjectAsync(rival);
        Assert.Contains((await Json(await reviewer.GetAsync("/api/review-requests")))["open"]!.AsArray(), r => r!["id"]!.GetValue<int>() == id);

        Assert.Equal("Claimed", (await Json(await reviewer.PostAsync($"/api/review-requests/{id}/claim", null)))["status"]!.GetValue<string>());
        Assert.Equal("review_not_open", await Code(await rival.PostAsync($"/api/review-requests/{id}/claim", null)));
        Assert.Equal("not_reviewer", await Code(await rival.PutAsJsonAsync($"/api/review-requests/{id}/review", new { scores = await AllScores(rival, 4) })));
    }

    [Fact]
    public async Task A_completed_review_counts_as_reviewed_for_the_requester_and_earns_the_reviewer_xp()
    {
        var requester = await factory.CreateUserClientAsync();
        var reviewer = await factory.CreateUserClientAsync();
        await FinishProjectAsync(requester);
        await FinishProjectAsync(reviewer);
        var id = (await Json(await requester.PostAsync($"/api/projects/{ProjectId}/review-request", null)))["id"]!.GetValue<int>();
        await Json(await reviewer.PostAsync($"/api/review-requests/{id}/claim", null));

        var scores = await AllScores(reviewer, 3);
        var partial = scores.Take(1).ToDictionary(kv => kv.Key, kv => kv.Value);
        Assert.Equal(HttpStatusCode.BadRequest, (await reviewer.PutAsJsonAsync($"/api/review-requests/{id}/review", new { scores = partial })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await reviewer.PutAsJsonAsync($"/api/review-requests/{id}/review",
            new { scores = scores.ToDictionary(kv => kv.Key, _ => 5) })).StatusCode);

        var done = await Json(await reviewer.PutAsJsonAsync($"/api/review-requests/{id}/review", new { scores, notes = "Clear structure; add tests for the repository." }));
        Assert.Equal("Completed", done["status"]!.GetValue<string>());

        // The requester sees the review, gets notified, and the rubric points are now at the Reviewed tier.
        var mine = await Json(await requester.GetAsync($"/api/projects/{ProjectId}/review-request"));
        Assert.Equal(3, mine["scores"]!.AsObject().First().Value!.GetValue<int>());
        Assert.Contains((await Json(await requester.GetAsync("/api/notifications")))["items"]!.AsArray(),
            n => n!["kind"]!.GetValue<string>() == "ReviewCompleted");
        (await requester.GetAsync("/api/skill-level")).EnsureSuccessStatusCode();
        var history = (await Json(await requester.GetAsync("/api/skill-level/history?pageSize=100")))["items"]!.AsArray();
        Assert.Contains(history, i => i!["sourceKey"]!.GetValue<string>().StartsWith($"project-review:{ProjectId}:")
                                      && i["verification"]!.GetValue<string>() == "Reviewed" && i["points"]!.GetValue<int>() > 0);

        // 30 points at the Evidenced tier (×0.75): the review itself is the evidence, nobody checks the reviewer.
        Assert.Equal(23, await XpOf(reviewer, k => k == $"review-given:{id}"));
    }

    [Fact]
    public async Task Review_requests_are_private_to_their_two_parties()
    {
        var requester = await factory.CreateUserClientAsync();
        var reviewer = await factory.CreateUserClientAsync();
        var outsider = await factory.CreateUserClientAsync();
        await FinishProjectAsync(requester);
        await FinishProjectAsync(reviewer);
        await FinishProjectAsync(outsider);
        var id = (await Json(await requester.PostAsync($"/api/projects/{ProjectId}/review-request", null)))["id"]!.GetValue<int>();
        await Json(await reviewer.PostAsync($"/api/review-requests/{id}/claim", null));

        var lists = await Json(await outsider.GetAsync("/api/review-requests"));
        Assert.DoesNotContain(lists["open"]!.AsArray(), r => r!["id"]!.GetValue<int>() == id);
        Assert.Empty(lists["requested"]!.AsArray());
        Assert.Empty(lists["reviewing"]!.AsArray());
        Assert.Equal("not_reviewer", await Code(await outsider.PostAsync($"/api/review-requests/{id}/release", null)));
        Assert.Equal("review_not_cancellable", await Code(await outsider.DeleteAsync($"/api/review-requests/{id}")));
        Assert.DoesNotContain("@", (await outsider.GetStringAsync("/api/review-requests")));

        // Giving it back reopens it; the requester can cancel.
        Assert.Equal("Open", (await Json(await reviewer.PostAsync($"/api/review-requests/{id}/release", null)))["status"]!.GetValue<string>());
        Assert.Equal(HttpStatusCode.NoContent, (await requester.DeleteAsync($"/api/review-requests/{id}")).StatusCode);
    }
}
