using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>
/// Roadmaps (tracks): learners follow one, shared phases count in each, and a draft roadmap (unpublished) is visible
/// to administrators only. This class has its own database, so the draft content it adds can't reach other tests.
/// </summary>
public class TrackTests(TrackTests.Factory factory) : IClassFixture<TrackTests.Factory>
{
    public class Factory : ApiFactory;

    private const string DotNet = "dotnet-fullstack";
    private const string Ai = "ai-app-developer";
    private const string Android = "android-developer";

    private static async Task<JsonNode> Json(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, $"{(int)response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
        return JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
    }

    private static IEnumerable<string> Slugs(JsonNode tracks) => tracks["tracks"]!.AsArray().Select(t => t!["slug"]!.GetValue<string>());

    [Fact]
    public async Task Visitors_and_learners_see_only_published_roadmaps_and_new_learners_have_not_chosen()
    {
        var anonymous = await Json(await factory.CreateClient().GetAsync("/api/tracks"));
        Assert.Equal([DotNet, Android], Slugs(anonymous));
        var card = anonymous["tracks"]![0]!;
        Assert.Equal(14, card["phaseCount"]!.GetValue<int>());
        Assert.True(card["topicCount"]!.GetValue<int>() >= 166);
        Assert.Contains("Angular", card["technologies"]!.AsArray().Select(t => t!.GetValue<string>()));
        Assert.Null(anonymous["chosenSlug"]);

        var learner = await factory.CreateUserClientAsync();
        var mine = await Json(await learner.GetAsync("/api/tracks"));
        Assert.Equal([DotNet, Android], Slugs(mine));
        Assert.Null(mine["chosenSlug"]);
        Assert.Equal(DotNet, mine["activeSlug"]!.GetValue<string>());

        // A draft can't be chosen by a learner; a published one can.
        Assert.Equal(HttpStatusCode.NotFound, (await learner.PutAsJsonAsync("/api/tracks/active", new { slug = Ai })).StatusCode);
        var chosen = await Json(await learner.PutAsJsonAsync("/api/tracks/active", new { slug = DotNet }));
        Assert.Equal(DotNet, chosen["chosenSlug"]!.GetValue<string>());
        Assert.Equal(DotNet, (await Json(await learner.GetAsync("/api/roadmap")))["trackSlug"]!.GetValue<string>());
    }

    [Fact]
    public async Task An_admin_can_preview_the_draft_roadmap_and_still_open_and_update_topics_outside_it()
    {
        var (admin, _) = await factory.CreateAdminClientAsync();
        var tracks = await Json(await admin.GetAsync("/api/tracks"));
        Assert.Equal([DotNet, Ai, Android], Slugs(tracks));
        Assert.False(tracks["tracks"]![2]!["isDraft"]!.GetValue<bool>());
        Assert.True(tracks["tracks"]![1]!["isDraft"]!.GetValue<bool>());

        await Json(await admin.PutAsJsonAsync("/api/tracks/active", new { slug = Ai }));
        var roadmap = await Json(await admin.GetAsync("/api/roadmap"));
        Assert.Equal(Ai, roadmap["trackSlug"]!.GetValue<string>());
        var phases = roadmap["phases"]!.AsArray();
        // The shared C# and ASP.NET Core phases first (another test in this class may add a draft phase after them).
        Assert.Equal(["csharp-fundamentals", "object-oriented-programming", "modern-csharp", "aspnet-core"],
            phases.Take(4).Select(p => p!["slug"]!.GetValue<string>()));
        Assert.Equal([1, 2, 3, 4], phases.Take(4).Select(p => p!["position"]!.GetValue<int>()));
        // The shared C# phase names the other roadmap that holds it.
        Assert.Contains(DotNet, phases[0]!["sharedWith"]!.AsArray().Select(s => s!.GetValue<string>()));

        // EF Core is not in the AI roadmap: its topic page and progress still work.
        var efTopic = (await Json(await admin.GetAsync("/api/topics?q=DbContext&pageSize=5")))["items"]!.AsArray()[0]!["id"]!.GetValue<int>();
        await Json(await admin.GetAsync($"/api/topics/{efTopic}"));
        await Json(await admin.PutAsJsonAsync($"/api/topics/{efTopic}/progress", new { status = "InProgress", knowledge = "NeedReview", confidence = 2 }));
        foreach (var page in new[] { "/api/dashboard", "/api/recommendations", "/api/study-plan?minutes=60" })
            Assert.True((await admin.GetAsync(page)).IsSuccessStatusCode, page);

        // Lists follow the roadmap by default (the AI draft holds only the C# and ASP.NET Core phases for now);
        // ?all=true shows every roadmap's content.
        var roadmapTopics = phases.SelectMany(p => p!["topics"]!.AsArray()).Select(t => t!["id"]!.GetValue<int>()).ToHashSet();
        var mine = (await Json(await admin.GetAsync("/api/practice")))["exercises"]!.AsArray();
        var every = (await Json(await admin.GetAsync("/api/practice?all=true")))["exercises"]!.AsArray();
        Assert.All(mine, e => Assert.Contains(e!["topicId"]!.GetValue<int>(), roadmapTopics));
        Assert.True(every.Count > mine.Count);
        Assert.Contains(every, e => e!["topicId"]!.GetValue<int>() == efTopic);
        foreach (var (url, path) in new[] { ("/api/interviews", "questions"), ("/api/glossary", ""), ("/api/guided-projects", ""), ("/api/resources", "") })
        {
            int Count(JsonNode n) => (path == "" ? n : n[path]!).AsArray().Count;
            Assert.True(Count(await Json(await admin.GetAsync(url))) < Count(await Json(await admin.GetAsync(url + (url.Contains('?') ? "&" : "?") + "all=true"))), url);
        }

        // Progress is per topic, so switching back keeps it.
        await Json(await admin.PutAsJsonAsync("/api/tracks/active", new { slug = DotNet }));
        Assert.Equal(14, (await Json(await admin.GetAsync("/api/roadmap")))["phases"]!.AsArray().Count);
    }

    [Fact]
    public async Task Previous_and_next_topics_stay_inside_the_roadmap()
    {
        var learner = await factory.CreateUserClientAsync();
        await Json(await learner.PutAsJsonAsync("/api/tracks/active", new { slug = Android }));
        var topics = (await Json(await learner.GetAsync("/api/roadmap")))["phases"]!.AsArray()
            .SelectMany(p => p!["topics"]!.AsArray()).Select(t => t!["id"]!.GetValue<int>()).ToList();

        // The first Android topic has no previous one (the AI and .NET phases come earlier in the catalogue).
        var first = await Json(await learner.GetAsync($"/api/topics/{topics[0]}"));
        Assert.Null(first["previous"]);
        Assert.Equal(topics[1], first["next"]!["id"]!.GetValue<int>());
        var last = await Json(await learner.GetAsync($"/api/topics/{topics[^1]}"));
        Assert.Null(last["next"]);
        Assert.Equal(topics[^2], last["previous"]!["id"]!.GetValue<int>());

        // A .NET topic opened from the Android roadmap still links to its .NET neighbours.
        await Json(await learner.PutAsJsonAsync("/api/tracks/active", new { slug = DotNet }));
        var dotnet = (await Json(await learner.GetAsync("/api/roadmap")))["phases"]!.AsArray()
            .SelectMany(p => p!["topics"]!.AsArray()).Select(t => t!["id"]!.GetValue<int>()).ToList();
        await Json(await learner.PutAsJsonAsync("/api/tracks/active", new { slug = Android }));
        var lastDotnet = await Json(await learner.GetAsync($"/api/topics/{dotnet[^1]}"));
        Assert.Null(lastDotnet["next"]);
        Assert.Equal(dotnet[^2], lastDotnet["previous"]!["id"]!.GetValue<int>());
    }

    [Fact]
    public async Task Draft_content_never_reaches_a_learner()
    {
        // A draft phase that belongs only to the unpublished roadmap, with a topic, an exercise, a quiz question and an
        // interview question, as a content stage would add it.
        const string marker = "Zqxdraftmarker";
        int topicId, phaseId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var phase = new Phase { Slug = "draft-ai-phase", Order = 99, TitleEn = marker, TitleAr = marker, IsDraft = true };
            var topic = new Topic { Slug = "draft-ai-topic", Phase = phase, Order = 1, TitleEn = marker, TitleAr = marker, SummaryEn = marker, IsDraft = true };
            db.Topics.Add(topic);
            db.PracticeExercises.Add(new PracticeExercise { Key = "draft-ai-exercise", Topic = topic, TitleEn = marker, TitleAr = marker });
            db.InterviewQuestions.Add(new InterviewQuestion { Key = "draft-ai-question", Topic = topic, QuestionEn = marker, QuestionAr = marker });
            await db.SaveChangesAsync();
            var track = await db.Tracks.SingleAsync(t => t.Slug == Ai);
            db.TrackPhases.Add(new TrackPhase { TrackId = track.Id, PhaseId = phase.Id, Position = 5 });
            await db.SaveChangesAsync();
            topicId = topic.Id;
            phaseId = phase.Id;
        }

        var learner = await factory.CreateUserClientAsync();
        Assert.Equal(HttpStatusCode.NotFound, (await learner.GetAsync($"/api/topics/{topicId}")).StatusCode);
        Assert.Empty((await Json(await learner.GetAsync($"/api/search?q={marker}")))["groups"]!.AsArray());
        foreach (var url in new[] { $"/api/topics?q={marker}", "/api/practice?q=" + marker,
                     "/api/interviews", "/api/roadmap", "/api/tracks" })
        {
            var response = await learner.GetAsync(url);
            Assert.True(response.IsSuccessStatusCode, $"{url}: {(int)response.StatusCode}");
            Assert.DoesNotContain(marker, await response.Content.ReadAsStringAsync(), StringComparison.OrdinalIgnoreCase);
        }
        Assert.DoesNotContain(marker, await factory.CreateClient().GetStringAsync("/api/tracks"));
        Assert.Equal(HttpStatusCode.NotFound, (await learner.PostAsJsonAsync("/api/certificates", new { phaseId })).StatusCode);

        var (admin, _) = await factory.CreateAdminClientAsync();
        Assert.Contains(marker, await admin.GetStringAsync($"/api/topics/{topicId}"));
    }

    [Fact]
    public async Task A_certificate_names_the_roadmap_and_placement_and_admin_counts_follow_roadmaps()
    {
        // A learner on the .NET roadmap finishes the shared C# phase: the certificate names that roadmap.
        var learner = await factory.CreateUserClientAsync();
        await Json(await learner.PutAsJsonAsync("/api/tracks/active", new { slug = DotNet }));
        var phase = (await Json(await learner.GetAsync("/api/roadmap")))["phases"]![0]!;
        foreach (var t in phase["topics"]!.AsArray())
            (await learner.PutAsJsonAsync($"/api/topics/{t!["id"]}/progress", new { status = "Completed", knowledge = "AlreadyKnow", confidence = 4 })).EnsureSuccessStatusCode();
        var code = (await Json(await learner.PostAsJsonAsync("/api/certificates", new { phaseId = phase["id"]!.GetValue<int>() })))["code"]!.GetValue<string>();
        var verified = await Json(await factory.CreateClient().GetAsync($"/api/certificates/{code}"));
        Assert.Equal(".NET full-stack developer", verified["trackTitleEn"]!.GetValue<string>());
        Assert.Equal(1, verified["phaseOrder"]!.GetValue<int>());
        Assert.Equal(".NET full-stack developer", (await Json(await learner.GetAsync("/api/certificates"))).AsArray()[0]!["trackTitleEn"]!.GetValue<string>());

        // The placement check covers the first phases of the learner's roadmap (up to PlacementService.LastPhaseOrder).
        var (admin, _) = await factory.CreateAdminClientAsync();
        await Json(await admin.PutAsJsonAsync("/api/tracks/active", new { slug = Ai }));
        var aiPhases = (await Json(await admin.GetAsync("/api/roadmap")))["phases"]!.AsArray()
            .Where(p => p!["position"]!.GetValue<int>() <= DevPath.Api.Services.PlacementService.LastPhaseOrder)
            .Select(p => p!["id"]!.GetValue<int>()).ToHashSet();
        var placement = (await Json(await admin.GetAsync("/api/placement")))["questions"]!.AsArray();
        Assert.NotEmpty(placement);
        Assert.All(placement, q => Assert.Contains(q!["phaseId"]!.GetValue<int>(), aiPhases));

        // Admins see how many accounts follow each roadmap, and how many haven't chosen.
        var roadmaps = (await Json(await admin.GetAsync("/api/admin/usage")))["roadmaps"]!.AsArray();
        Assert.True(roadmaps.Single(r => r!["slug"]!.GetValue<string>() == DotNet)!["learners"]!.GetValue<int>() >= 1);
        Assert.True(roadmaps.Single(r => r!["slug"]!.GetValue<string>() == Ai)!["learners"]!.GetValue<int>() >= 1);
        Assert.Contains(roadmaps, r => r!["slug"]!.GetValue<string>() == "");
    }
}
