using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;

namespace DevPath.Api.Tests;

/// <summary>Discussions, notifications and learning paths: who can see, change and vote on what.</summary>
public class DiscussionsAndPathsTests(ApiFactory factory) : IClassFixture<ApiFactory>, IAsyncLifetime
{
    private HttpClient _a = null!;
    private HttpClient _b = null!;

    public async Task InitializeAsync()
    {
        _a = await factory.CreateUserClientAsync();
        _b = await factory.CreateUserClientAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    private static async Task<JsonNode> Json(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
    }

    private async Task<int> AskAsync(HttpClient client, int topicId = 1, string title = "How does LINQ defer execution?")
    {
        var response = await client.PostAsJsonAsync("/api/discussions", new { topicId, titleEn = title, titleAr = title, bodyEn = "Please explain.", bodyAr = "Please explain." });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await Json(response))["id"]!.GetValue<int>();
    }

    private async Task<int> ReplyAsync(HttpClient client, int discussionId)
    {
        var response = await client.PostAsJsonAsync($"/api/discussions/{discussionId}/replies", new { bodyEn = "It runs on enumeration.", bodyAr = "It runs on enumeration." });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return (await Json(response))["id"]!.GetValue<int>();
    }

    private static async Task<int> UnreadAsync(HttpClient client) =>
        (await Json(await client.GetAsync("/api/notifications/count")))["count"]!.GetValue<int>();

    [Fact]
    public async Task Discussions_are_visible_to_every_account_but_only_the_author_can_change_them()
    {
        var id = await AskAsync(_a);

        var seenByB = await Json(await _b.GetAsync($"/api/discussions/{id}"));
        Assert.Equal("How does LINQ defer execution?", seenByB["titleEn"]!.GetValue<string>());
        Assert.Contains((await Json(await _b.GetAsync("/api/discussions?topicId=1")))["items"]!.AsArray(), d => d!["id"]!.GetValue<int>() == id);

        var edit = new { titleEn = "hijacked", titleAr = "hijacked", bodyEn = "x", bodyAr = "x" };
        Assert.Equal(HttpStatusCode.Forbidden, (await _b.PutAsJsonAsync($"/api/discussions/{id}", edit)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _b.DeleteAsync($"/api/discussions/{id}")).StatusCode);

        Assert.Equal(HttpStatusCode.OK, (await _a.PutAsJsonAsync($"/api/discussions/{id}", edit)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await _a.DeleteAsync($"/api/discussions/{id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _b.GetAsync($"/api/discussions/{id}")).StatusCode);
    }

    [Fact]
    public async Task A_discussion_needs_a_real_topic()
    {
        var response = await _a.PostAsJsonAsync("/api/discussions", new { topicId = 999999, titleEn = "t", titleAr = "t", bodyEn = "b", bodyAr = "b" });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Replying_and_accepting_notify_the_other_person_and_only_the_asker_can_accept()
    {
        var id = await AskAsync(_a);
        var before = await UnreadAsync(_a);

        var replyId = await ReplyAsync(_b, id);
        Assert.Equal(before + 1, await UnreadAsync(_a));

        await ReplyAsync(_a, id);   // replying to your own question notifies nobody
        Assert.Equal(before + 1, await UnreadAsync(_a));

        Assert.Equal(HttpStatusCode.Forbidden, (await _b.PostAsJsonAsync($"/api/discussions/{id}/accept", new { replyId })).StatusCode);

        var bBefore = await UnreadAsync(_b);
        Assert.Equal(HttpStatusCode.OK, (await _a.PostAsJsonAsync($"/api/discussions/{id}/accept", new { replyId })).StatusCode);
        Assert.Equal(bBefore + 1, await UnreadAsync(_b));

        var detail = await Json(await _a.GetAsync($"/api/discussions/{id}"));
        Assert.Equal(replyId, detail["acceptedReplyId"]!.GetValue<int>());
        Assert.Contains(detail["replies"]!.AsArray(), r => r!["id"]!.GetValue<int>() == replyId && r["isAccepted"]!.GetValue<bool>());
    }

    [Fact]
    public async Task Notifications_are_private_and_can_be_marked_read()
    {
        var id = await AskAsync(_a);
        await ReplyAsync(_b, id);

        Assert.DoesNotContain((await Json(await _b.GetAsync("/api/notifications?unreadOnly=true")))["items"]!.AsArray(),
            n => n!["discussionId"]?.GetValue<int>() == id);

        var mine = (await Json(await _a.GetAsync("/api/notifications?unreadOnly=true")))["items"]!.AsArray();
        var notification = Assert.Single(mine, n => n!["discussionId"]!.GetValue<int>() == id);
        var notificationId = notification!["id"]!.GetValue<long>();

        // Another account marking it read changes nothing.
        await _b.PostAsJsonAsync("/api/notifications/read", new { ids = new[] { notificationId } });
        Assert.Contains((await Json(await _a.GetAsync("/api/notifications?unreadOnly=true")))["items"]!.AsArray(), n => n!["id"]!.GetValue<long>() == notificationId);

        await _a.PostAsync("/api/notifications/read-all", null);
        Assert.Equal(0, await UnreadAsync(_a));
    }

    [Fact]
    public async Task Votes_count_once_per_account_and_can_be_changed_or_removed()
    {
        var id = await AskAsync(_a);

        Assert.Equal(1, (await Json(await _b.PostAsJsonAsync($"/api/discussions/{id}/vote", new { value = 1 })))["score"]!.GetValue<int>());
        Assert.Equal(2, (await Json(await _a.PostAsJsonAsync($"/api/discussions/{id}/vote", new { value = 1 })))["score"]!.GetValue<int>());

        // B flips the vote: +1 becomes -1, a swing of two.
        Assert.Equal(0, (await Json(await _b.PostAsJsonAsync($"/api/discussions/{id}/vote", new { value = -1 })))["score"]!.GetValue<int>());
        Assert.Equal(1, (await Json(await _b.PostAsJsonAsync($"/api/discussions/{id}/vote", new { value = 0 })))["score"]!.GetValue<int>());

        Assert.Equal(HttpStatusCode.BadRequest, (await _b.PostAsJsonAsync($"/api/discussions/{id}/vote", new { value = 2 })).StatusCode);

        var forA = await Json(await _a.GetAsync($"/api/discussions/{id}"));
        var forB = await Json(await _b.GetAsync($"/api/discussions/{id}"));
        Assert.Equal(1, forA["score"]!.GetValue<int>());
        Assert.Equal(1, forA["myVote"]!.GetValue<int>());
        Assert.Null(forB["myVote"]);   // B removed their vote; A's is not shown to B
    }

    [Fact]
    public async Task Reply_votes_are_tracked_separately_from_the_question()
    {
        var id = await AskAsync(_a);
        var replyId = await ReplyAsync(_a, id);

        Assert.Equal(1, (await Json(await _b.PostAsJsonAsync($"/api/discussions/{id}/replies/{replyId}/vote", new { value = 1 })))["score"]!.GetValue<int>());

        var detail = await Json(await _b.GetAsync($"/api/discussions/{id}"));
        Assert.Equal(0, detail["score"]!.GetValue<int>());
        var reply = Assert.Single(detail["replies"]!.AsArray());
        Assert.Equal(1, reply!["score"]!.GetValue<int>());
        Assert.Equal(1, reply["myVote"]!.GetValue<int>());
    }

    [Fact]
    public async Task Only_an_administrator_can_pin()
    {
        var id = await AskAsync(_a);
        Assert.Equal(HttpStatusCode.Forbidden, (await _a.PostAsync($"/api/discussions/{id}/pin", null)).StatusCode);

        var (admin, _) = await factory.CreateAdminClientAsync();

        var pinned = await Json(await admin.PostAsync($"/api/discussions/{id}/pin", null));
        Assert.True(pinned["isPinned"]!.GetValue<bool>());
        Assert.True((await Json(await _b.GetAsync($"/api/discussions/{id}")))["isPinned"]!.GetValue<bool>());
    }

    /// <summary>Opens the developer level (which reconciles the ledger) and sums the rows of one source.</summary>
    private static async Task<int> XpOf(HttpClient client, string sourceKey)
    {
        (await client.GetAsync("/api/skill-level")).EnsureSuccessStatusCode();
        var items = (await Json(await client.GetAsync("/api/skill-level/history?pageSize=100")))["items"]!.AsArray();
        return items.Where(i => i!["sourceKey"]!.GetValue<string>() == sourceKey).Sum(i => i!["points"]!.GetValue<int>());
    }

    [Fact]
    public async Task An_accepted_answer_earns_its_author_points_once_and_loses_them_when_unaccepted()
    {
        var c = await factory.CreateUserClientAsync();
        var id = await AskAsync(_a, title: "Which collection keeps insertion order?");
        var bReply = await ReplyAsync(_b, id);
        var cReply = await ReplyAsync(c, id);

        (await _a.PostAsJsonAsync($"/api/discussions/{id}/accept", new { replyId = bReply })).EnsureSuccessStatusCode();
        Assert.Equal(15, await XpOf(_b, $"discussion-accept:{bReply}"));
        Assert.Equal(15, await XpOf(_b, $"discussion-accept:{bReply}"));   // a second visit writes nothing new

        (await _a.PostAsJsonAsync($"/api/discussions/{id}/accept", new { replyId = cReply })).EnsureSuccessStatusCode();
        Assert.Equal(0, await XpOf(_b, $"discussion-accept:{bReply}"));
        Assert.Equal(15, await XpOf(c, $"discussion-accept:{cReply}"));
    }

    [Fact]
    public async Task Accepting_your_own_reply_earns_nothing()
    {
        var id = await AskAsync(_a, title: "Answering myself");
        var mine = await ReplyAsync(_a, id);
        (await _a.PostAsJsonAsync($"/api/discussions/{id}/accept", new { replyId = mine })).EnsureSuccessStatusCode();
        Assert.Equal(0, await XpOf(_a, $"discussion-accept:{mine}"));
    }

    [Fact]
    public async Task Discussions_appear_in_global_search()
    {
        var title = $"Searchable question {Guid.NewGuid():N}";
        var id = await AskAsync(_a, title: title);
        var result = await Json(await _b.GetAsync($"/api/search?q={Uri.EscapeDataString(title)}"));
        var group = Assert.Single(result["groups"]!.AsArray(), g => g!["category"]!.GetValue<string>() == "discussions");
        Assert.Equal(id, Assert.Single(group!["items"]!.AsArray())!["id"]!.GetValue<int>());
    }

    // ---------- Learning paths ----------

    [Fact]
    public async Task An_active_path_steers_the_next_recommendation()
    {
        var client = await factory.CreateUserClientAsync();
        var ranked = (await Json(await client.GetAsync("/api/recommendations?take=10"))).AsArray();
        Assert.True(ranked.Count >= 2, $"expected at least two eligible topics, got {ranked.Count}");
        var target = ranked[^1]!["topic"]!["id"]!.GetValue<int>();
        Assert.NotEqual(target, ranked[0]!["topic"]!["id"]!.GetValue<int>());

        var path = await Json(await client.PostAsJsonAsync("/api/paths", new { nameEn = "Focus", nameAr = "Focus", topicIds = new[] { target } }));
        (await client.PostAsync($"/api/paths/{path["id"]!.GetValue<int>()}/activate", null)).EnsureSuccessStatusCode();

        var first = (await Json(await client.GetAsync("/api/recommendations?take=1"))).AsArray()[0]!;
        Assert.Equal(target, first["topic"]!["id"]!.GetValue<int>());
        Assert.Contains(first["reasons"]!.AsArray(), r => r!["code"]!.GetValue<string>() == "activePath");
    }

    [Fact]
    public async Task Built_in_paths_are_listed_for_everyone_and_cannot_be_changed()
    {
        var list = (await Json(await _a.GetAsync("/api/paths"))).AsArray();
        var builtIn = list.Where(p => p!["isBuiltIn"]!.GetValue<bool>()).ToList();
        Assert.True(builtIn.Count >= 5, $"expected the 5 seeded paths, found {builtIn.Count}");
        Assert.All(builtIn, p => Assert.True(p!["topicCount"]!.GetValue<int>() > 0));

        var id = builtIn.First(p => p!["slug"]!.GetValue<string>() == "database-expert")!["id"]!.GetValue<int>();
        var detail = await Json(await _b.GetAsync($"/api/paths/{id}"));
        Assert.NotEmpty(detail["phases"]!.AsArray());

        Assert.Equal(HttpStatusCode.Forbidden, (await _a.DeleteAsync($"/api/paths/{id}")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _a.PutAsJsonAsync($"/api/paths/{id}",
            new { nameEn = "x", nameAr = "x", topicIds = new[] { 1 } })).StatusCode);
    }

    [Fact]
    public async Task Custom_paths_are_private_to_their_creator()
    {
        var created = await _a.PostAsJsonAsync("/api/paths", new { nameEn = "My plan", nameAr = "خطتي", topicIds = new[] { 1, 2, 3 } });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var path = await Json(created);
        var id = path["id"]!.GetValue<int>();
        Assert.StartsWith("custom-", path["slug"]!.GetValue<string>());
        Assert.Equal(3, path["topics"]!.AsArray().Count);

        Assert.DoesNotContain((await Json(await _b.GetAsync("/api/paths"))).AsArray(), p => p!["id"]!.GetValue<int>() == id);
        Assert.Contains((await Json(await _a.GetAsync("/api/paths"))).AsArray(), p => p!["id"]!.GetValue<int>() == id);
        Assert.Equal(HttpStatusCode.Forbidden, (await _b.GetAsync($"/api/paths/{id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _b.PostAsync($"/api/paths/{id}/activate", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await _b.DeleteAsync($"/api/paths/{id}")).StatusCode);

        var updated = await Json(await _a.PutAsJsonAsync($"/api/paths/{id}", new { nameEn = "Renamed", nameAr = "x", topicIds = new[] { 4 } }));
        Assert.Equal("Renamed", updated["nameEn"]!.GetValue<string>());
        Assert.Single(updated["topics"]!.AsArray());

        Assert.Equal(HttpStatusCode.NoContent, (await _a.DeleteAsync($"/api/paths/{id}")).StatusCode);
    }

    [Fact]
    public async Task A_custom_path_needs_between_one_and_fifty_real_topics()
    {
        Assert.Equal(HttpStatusCode.BadRequest, (await _a.PostAsJsonAsync("/api/paths",
            new { nameEn = "Empty", nameAr = "Empty", topicIds = Array.Empty<int>() })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _a.PostAsJsonAsync("/api/paths",
            new { nameEn = "Ghost", nameAr = "Ghost", topicIds = new[] { 999999 } })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await _a.PostAsJsonAsync("/api/paths",
            new { nameEn = "Huge", nameAr = "Huge", topicIds = Enumerable.Range(1, 51).ToArray() })).StatusCode);
    }

    [Fact]
    public async Task Activation_and_progress_are_per_account()
    {
        var list = (await Json(await _a.GetAsync("/api/paths"))).AsArray();
        var id = list.First(p => p!["slug"]!.GetValue<string>() == "database-expert")!["id"]!.GetValue<int>();

        Assert.Equal(HttpStatusCode.OK, (await _a.PostAsync($"/api/paths/{id}/activate", null)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await _a.PostAsync($"/api/paths/{id}/activate", null)).StatusCode);   // idempotent
        Assert.Single((await Json(await _a.GetAsync("/api/paths/active"))).AsArray());
        Assert.Empty((await Json(await _b.GetAsync("/api/paths/active"))).AsArray());

        var topicInPath = (await Json(await _a.GetAsync($"/api/paths/{id}")))["phases"]![0]!["topics"]![0]!["topicId"]!.GetValue<int>();
        await _a.PutAsJsonAsync($"/api/topics/{topicInPath}/progress", new { status = "Completed", knowledge = "AlreadyKnow", confidence = 5 });

        var mine = (await Json(await _a.GetAsync("/api/paths"))).AsArray().First(p => p!["id"]!.GetValue<int>() == id)!;
        var theirs = (await Json(await _b.GetAsync("/api/paths"))).AsArray().First(p => p!["id"]!.GetValue<int>() == id)!;
        Assert.True(mine["progressPercent"]!.GetValue<double>() > 0);
        Assert.Equal(0, theirs["progressPercent"]!.GetValue<double>());
        Assert.False(theirs["isActivated"]!.GetValue<bool>());

        Assert.Equal(HttpStatusCode.OK, (await _a.DeleteAsync($"/api/paths/{id}/activate")).StatusCode);
        Assert.Empty((await Json(await _a.GetAsync("/api/paths/active"))).AsArray());
    }
}
