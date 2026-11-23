using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>The optional placement check: scoring per phase, and marking only the phases the learner confirms.</summary>
public class PlacementTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, await response.Content.ReadAsStringAsync());
        return JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
    }

    private async Task<T> InDb<T>(Func<AppDbContext, Task<T>> query)
    {
        using var scope = factory.Services.CreateScope();
        return await query(scope.ServiceProvider.GetRequiredService<AppDbContext>());
    }

    /// <summary>Phase id by roadmap order (1-based).</summary>
    private Task<Dictionary<int, int>> PhaseIdsAsync() => InDb(db => db.Phases.ToDictionaryAsync(p => p.Order, p => p.Id));

    [Fact]
    public void Score_counts_per_phase_and_knows_a_phase_only_when_every_answer_is_right()
    {
        var scores = PlacementService.Score([(1, true), (2, true), (1, true), (2, false), (3, false), (3, false)]);
        Assert.Equal([(1, 2, 2, true), (2, 1, 2, false), (3, 0, 2, false)], scores);
        Assert.Empty(PlacementService.Score([]));
    }

    [Fact]
    public async Task Serves_two_questions_per_phase_for_phases_one_to_eight_without_answers()
    {
        var client = await factory.CreateUserClientAsync();
        var response = await client.GetAsync("/api/placement");
        var text = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("answerIndex", text, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("explanation", text, StringComparison.OrdinalIgnoreCase);

        var questions = (await Json(response))["questions"]!.AsArray();
        var phases = await PhaseIdsAsync();
        var expected = Enumerable.Range(1, 8).Select(o => phases[o]).Order().ToList();
        var byPhase = questions.GroupBy(q => q!["phaseId"]!.GetValue<int>()).ToDictionary(g => g.Key, g => g.Count());
        Assert.Equal(expected, byPhase.Keys.Order().ToList());
        Assert.All(byPhase.Values, n => Assert.Equal(2, n));
        Assert.Equal(16, questions.Select(q => q!["id"]!.GetValue<int>()).Distinct().Count());
    }

    [Fact]
    public async Task Grades_per_phase_and_marks_nothing()
    {
        var client = await factory.CreateUserClientAsync();
        var quiz = await Json(await client.GetAsync("/api/placement"));
        var answerKey = await InDb(db => db.QuizQuestions.ToDictionaryAsync(q => q.Id, q => q.AnswerIndex));
        var phases = await PhaseIdsAsync();
        var (first, second) = (phases[1], phases[2]);

        // Everything right except one answer in phase 2.
        var wrongOnce = false;
        var answers = quiz["questions"]!.AsArray().Select(q =>
        {
            var id = q!["id"]!.GetValue<int>();
            var right = answerKey[id];
            if (q["phaseId"]!.GetValue<int>() == second && !wrongOnce) { wrongOnce = true; return new { questionId = id, choice = (right + 1) % 4 }; }
            return new { questionId = id, choice = right };
        }).ToList();

        var result = await Json(await client.PostAsJsonAsync("/api/placement/grade", new { answers }));
        var rows = result["phases"]!.AsArray().ToDictionary(p => p!["phaseId"]!.GetValue<int>());
        Assert.Equal(8, rows.Count);
        Assert.True(rows[first]!["known"]!.GetValue<bool>());
        Assert.Equal(2, rows[first]!["correct"]!.GetValue<int>());
        Assert.False(rows[second]!["known"]!.GetValue<bool>());
        Assert.Equal(1, rows[second]!["correct"]!.GetValue<int>());

        // Grading alone never marks a topic.
        var roadmap = await Json(await client.GetAsync("/api/roadmap"));
        var statuses = roadmap["phases"]!.AsArray().SelectMany(p => p!["topics"]!.AsArray()).Select(t => t!["status"]!.GetValue<string>());
        Assert.All(statuses, s => Assert.Equal("NotStarted", s));
    }

    [Fact]
    public async Task Rejects_incomplete_or_foreign_answers()
    {
        var client = await factory.CreateUserClientAsync();
        var quiz = await Json(await client.GetAsync("/api/placement"));
        var ids = quiz["questions"]!.AsArray().Select(q => q!["id"]!.GetValue<int>()).ToList();
        var outside = await InDb(db => db.QuizQuestions.Where(q => q.Topic.Phase.Order > 8).Select(q => q.Id).FirstAsync());

        async Task<HttpStatusCode> Post(IEnumerable<int> questionIds) =>
            (await client.PostAsJsonAsync("/api/placement/grade", new { answers = questionIds.Select(id => new { questionId = id, choice = 0 }) })).StatusCode;

        Assert.Equal(HttpStatusCode.BadRequest, await Post(ids.Skip(1)));                   // one missing
        Assert.Equal(HttpStatusCode.BadRequest, await Post(ids.Skip(1).Append(ids[1])));     // the same question twice
        Assert.Equal(HttpStatusCode.BadRequest, await Post(ids.Skip(1).Append(outside)));    // a question from phase 9+
        Assert.Equal(HttpStatusCode.OK, await Post(ids));
    }

    [Fact]
    public async Task Apply_marks_only_the_chosen_phases_for_the_current_user_and_is_idempotent()
    {
        var phases = await PhaseIdsAsync();
        var (chosenA, chosenB) = (phases[1], phases[3]);
        var learner = await factory.CreateUserClientAsync();
        var bystander = await factory.CreateUserClientAsync();

        // A topic already completed in a chosen phase stays completed.
        var completedTopic = await InDb(db => db.Topics.Where(t => t.PhaseId == chosenA).OrderBy(t => t.Order).Select(t => t.Id).FirstAsync());
        (await learner.PutAsJsonAsync($"/api/topics/{completedTopic}/progress", new { status = "Completed", knowledge = "NeedReview", confidence = 3 })).EnsureSuccessStatusCode();

        var first = await Json(await learner.PostAsJsonAsync("/api/placement/apply", new { phaseIds = new[] { chosenB, chosenA, chosenA } }));
        var expectedTopics = await InDb(db => db.Topics.CountAsync(t => t.PhaseId == chosenA || t.PhaseId == chosenB));
        Assert.Equal(expectedTopics - 1, first["topicsMarked"]!.GetValue<int>());

        var roadmap = await Json(await learner.GetAsync("/api/roadmap"));
        foreach (var phase in roadmap["phases"]!.AsArray())
        {
            var phaseId = phase!["id"]!.GetValue<int>();
            foreach (var t in phase["topics"]!.AsArray())
            {
                var (status, knowledge) = (t!["status"]!.GetValue<string>(), t["knowledge"]!.GetValue<string>());
                if (t["id"]!.GetValue<int>() == completedTopic) Assert.Equal("Completed", status);
                else if (phaseId == chosenA || phaseId == chosenB)
                {
                    Assert.Equal("Skipped", status);
                    Assert.Equal("AlreadyKnow", knowledge);
                    Assert.Equal(4, t["confidence"]!.GetValue<int>());
                }
                else Assert.Equal("NotStarted", status);
            }
        }

        // Sending it again changes nothing.
        var again = await Json(await learner.PostAsJsonAsync("/api/placement/apply", new { phaseIds = new[] { chosenA, chosenB } }));
        Assert.Equal(0, again["topicsMarked"]!.GetValue<int>());

        // Another account is untouched.
        var theirs = await Json(await bystander.GetAsync("/api/roadmap"));
        Assert.All(theirs["phases"]!.AsArray().SelectMany(p => p!["topics"]!.AsArray()),
            t => Assert.Equal("NotStarted", t!["status"]!.GetValue<string>()));
    }

    [Fact]
    public async Task Apply_refuses_phases_outside_the_check_and_marks_nothing()
    {
        var phases = await PhaseIdsAsync();
        var client = await factory.CreateUserClientAsync();
        var response = await client.PostAsJsonAsync("/api/placement/apply", new { phaseIds = new[] { phases[1], phases[9] } });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/placement/apply", new { phaseIds = Array.Empty<int>() })).StatusCode);

        var roadmap = await Json(await client.GetAsync("/api/roadmap"));
        Assert.All(roadmap["phases"]!.AsArray().SelectMany(p => p!["topics"]!.AsArray()),
            t => Assert.Equal("NotStarted", t!["status"]!.GetValue<string>()));
    }

    [Fact]
    public async Task Requires_sign_in()
    {
        var anonymous = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/placement")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.PostAsJsonAsync("/api/placement/apply", new { phaseIds = new[] { 1 } })).StatusCode);
    }
}
