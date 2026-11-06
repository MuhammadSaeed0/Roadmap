using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>The developer level through the HTTP API: the XP ledger, its idempotency, and existing progress.</summary>
public class SkillLevelApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response)
    {
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
    }

    private static async Task<JsonNode> Level(HttpClient client) => await Json(await client.GetAsync("/api/skill-level"));

    private async Task<int> FirstTopicAsync()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db.Topics.OrderBy(t => t.Phase.Order).ThenBy(t => t.Order).Select(t => t.Id).FirstAsync();
    }

    private async Task<List<XpTransaction>> LedgerAsync(string email)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userId = await db.Users.Where(u => u.Email == email).Select(u => u.Id).SingleAsync();
        return await db.XpTransactions.IgnoreQueryFilters().Where(x => x.UserId == userId).OrderBy(x => x.Id).ToListAsync();
    }

    private static Task<HttpResponseMessage> SetTopic(HttpClient client, int topic, string status) =>
        client.PutAsJsonAsync($"/api/topics/{topic}/progress", new { status, knowledge = "Unassessed" });

    private async Task PassLevelOneAsync(HttpClient client, int topic)
    {
        Dictionary<int, int> answers;
        using (var scope = factory.Services.CreateScope())
            answers = await scope.ServiceProvider.GetRequiredService<AppDbContext>().QuizQuestions.ToDictionaryAsync(q => q.Id, q => q.AnswerIndex);
        var quiz = await Json(await client.GetAsync($"/api/topics/{topic}/quiz?level=1"));
        var body = new
        {
            level = 1,
            answers = quiz["questions"]!.AsArray().Select(q => q!["id"]!.GetValue<int>()).Select(id => new { questionId = id, choice = answers[id] }),
        };
        var result = await Json(await client.PostAsJsonAsync($"/api/topics/{topic}/quiz", body));
        Assert.True(result["passed"]!.GetValue<bool>());
    }

    [Fact]
    public async Task A_new_learner_starts_as_a_beginner_with_every_category()
    {
        var client = await factory.CreateUserClientAsync();
        var level = await Level(client);
        Assert.Equal("beginner", level["level"]!.GetValue<string>());
        Assert.Equal("junior", level["nextLevel"]!.GetValue<string>());
        Assert.Equal(0, level["xp"]!.GetValue<int>());
        Assert.True(level["maxXp"]!.GetValue<int>() > 12000);
        Assert.Equal(14, level["categories"]!.AsArray().Count);
        Assert.Equal(5, level["levels"]!.AsArray().Count);
        Assert.NotEmpty(level["nextLevelRequirements"]!.AsArray());
        Assert.NotEmpty(level["assessment"]!.AsArray());
        Assert.Empty(level["recentTransactions"]!.AsArray());
        Assert.Contains(level["technologies"]!.AsArray(), t => t!["skill"]!.GetValue<string>() == "Angular");
    }

    [Fact]
    public async Task The_ledger_is_idempotent_and_records_reversals()
    {
        var email = factory.NewEmail();
        var client = await factory.CreateUserClientAsync(email);
        var topic = await FirstTopicAsync();

        (await SetTopic(client, topic, "Completed")).EnsureSuccessStatusCode();
        var first = await Level(client);
        var xp = first["xp"]!.GetValue<int>();
        Assert.True(xp > 0);
        var rows = await LedgerAsync(email);
        Assert.Equal(xp, rows.Sum(r => r.Points));

        // Reading again writes nothing new.
        var again = await Level(client);
        Assert.Equal(xp, again["xp"]!.GetValue<int>());
        Assert.Equal(rows.Count, (await LedgerAsync(email)).Count);

        // Re-opening the topic reverses its points with a new row; completing it again restores them.
        (await SetTopic(client, topic, "InProgress")).EnsureSuccessStatusCode();
        Assert.Equal(0, (await Level(client))["xp"]!.GetValue<int>());
        (await SetTopic(client, topic, "Completed")).EnsureSuccessStatusCode();
        Assert.Equal(xp, (await Level(client))["xp"]!.GetValue<int>());

        var topicRows = (await LedgerAsync(email)).Where(r => r.SourceKey == $"topic:{topic}").ToList();
        Assert.Equal(new[] { 1, 2, 3 }, topicRows.Select(r => r.Seq));
        Assert.Equal(new[] { xp, -xp, xp }, topicRows.Select(r => r.Points));
        Assert.Equal(new[] { xp, 0, xp }, topicRows.Select(r => r.Balance));
    }

    [Fact]
    public async Task Passing_a_quiz_verifies_the_topic_and_retaking_it_earns_nothing_more()
    {
        var email = factory.NewEmail();
        var client = await factory.CreateUserClientAsync(email);
        var topic = await FirstTopicAsync();
        (await SetTopic(client, topic, "Completed")).EnsureSuccessStatusCode();
        var selfReported = (await Level(client))["xp"]!.GetValue<int>();

        await PassLevelOneAsync(client, topic);
        var verified = await Level(client);
        var xp = verified["xp"]!.GetValue<int>();
        Assert.True(xp > selfReported);
        Assert.True(verified["stats"]!["verifiedPoints"]!.GetValue<int>() > 0);
        Assert.Equal(VerificationTier.QuizVerified, (await LedgerAsync(email)).Last(r => r.SourceKey == $"topic:{topic}").Verification);

        // The same answers again: more attempts and answers on record, but the same points.
        await PassLevelOneAsync(client, topic);
        var retaken = await Level(client);
        Assert.Equal(xp, retaken["xp"]!.GetValue<int>());
        Assert.Equal(2, retaken["stats"]!["quizAttempts"]!.GetValue<int>());
        Assert.Equal(100, retaken["stats"]!["accuracy"]!.GetValue<double>());
    }

    [Fact]
    public async Task Existing_progress_is_credited_the_first_time_without_changing_it()
    {
        var email = factory.NewEmail();
        var client = await factory.CreateUserClientAsync(email);
        var topic = await FirstTopicAsync();

        // Progress written before the developer level existed: a completed topic and a quiz attempt with no answer rows.
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var userId = await db.Users.Where(u => u.Email == email).Select(u => u.Id).SingleAsync();
            var questions = await db.QuizQuestions.CountAsync(q => q.TopicId == topic);
            var completedAt = new DateTime(2026, 10, 1, 9, 0, 0, DateTimeKind.Utc);
            db.TopicProgress.Add(new TopicProgress { UserId = userId, TopicId = topic, Status = TopicStatus.Completed, CompletedAt = completedAt, UpdatedAt = completedAt });
            db.QuizAttempts.Add(new QuizAttempt { UserId = userId, TopicId = topic, Level = 1, Score = questions, Total = questions, CreatedAt = completedAt });
            await db.SaveChangesAsync();
        }
        Assert.Empty(await LedgerAsync(email));

        var level = await Level(client);
        Assert.True(level["xp"]!.GetValue<int>() > 0);
        var rows = await LedgerAsync(email);
        Assert.Contains(rows, r => r.SourceKey == $"quiz-legacy:{topic}" && r.Points > 0);
        Assert.Contains(rows, r => r.SourceKey == $"topic:{topic}" && r.Verification == VerificationTier.QuizVerified);
        Assert.All(rows, r => Assert.Equal(new DateTime(2026, 10, 1, 9, 0, 0, DateTimeKind.Utc), r.OccurredAt));

        // The learner's own progress rows are untouched.
        using var check = factory.Services.CreateScope();
        var after = check.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal(1, await after.TopicProgress.IgnoreQueryFilters().CountAsync(p => p.TopicId == topic && p.Status == TopicStatus.Completed
            && after.Users.Any(u => u.Id == p.UserId && u.Email == email)));
    }

    /// <summary>
    /// The thresholds must be reachable: a learner who does all the real content well, leaves evidence (repository links,
    /// passed quizzes, ticked criteria) and reviews their projects reaches the top level. Self-reported work alone must not.
    /// </summary>
    [Theory]
    [InlineData(true, "expert")]
    [InlineData(false, "beginner")]
    public async Task Doing_everything_with_evidence_reaches_expert_but_ticking_boxes_does_not(bool withEvidence, string expected)
    {
        var email = factory.NewEmail();
        var client = await factory.CreateUserClientAsync(email);
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var userId = await db.Users.Where(u => u.Email == email).Select(u => u.Id).SingleAsync();
            var start = new DateTime(2026, 1, 1, 9, 0, 0, DateTimeKind.Utc);
            var day = 0;
            DateTime Next() => start.AddDays(day++ % 300).AddMinutes(day);

            var topics = await db.Topics.Select(t => t.Id).ToListAsync();
            foreach (var t in topics)
                db.TopicProgress.Add(new TopicProgress { UserId = userId, TopicId = t, Status = TopicStatus.Completed, CompletedAt = Next(), UpdatedAt = start });
            foreach (var v in (await db.CuratedVideos.Select(v => new { v.VideoId, v.TopicId }).ToListAsync()).DistinctBy(v => v.VideoId))
                db.VideoProgress.Add(new VideoProgress { UserId = userId, VideoId = v.VideoId, TopicId = v.TopicId, IsWatched = true, UpdatedAt = Next() });

            if (withEvidence)
            {
                foreach (var g in (await db.QuizQuestions.Select(q => new { q.Id, q.TopicId, q.AnswerIndex }).ToListAsync()).GroupBy(q => q.TopicId))
                {
                    var at = Next();
                    db.QuizAttempts.Add(new QuizAttempt
                    {
                        UserId = userId, TopicId = g.Key, Level = 1, Score = g.Count(), Total = g.Count(), CreatedAt = at,
                        Answers = g.Select(q => new QuizAnswer { UserId = userId, QuestionId = q.Id, Choice = q.AnswerIndex, IsCorrect = true, CreatedAt = at }).ToList(),
                    });
                    foreach (var quizLevel in new[] { 2, 3 })
                        db.QuizAttempts.Add(new QuizAttempt { UserId = userId, TopicId = g.Key, Level = quizLevel, Score = 6, Total = 6, CreatedAt = at });
                }
                foreach (var e in await db.PracticeExercises.Select(e => new { e.Id, e.AcceptanceEn }).ToListAsync())
                {
                    var criteria = DevPath.Api.Services.ProjectService.SplitLines(e.AcceptanceEn).Count;
                    db.PracticeProgress.Add(new PracticeProgress
                    {
                        UserId = userId, ExerciseId = e.Id, Status = PracticeStatus.Completed, UserAnswer = "My own explanation of the approach.",
                        CheckedCriteria = string.Join(',', Enumerable.Range(0, criteria)), CompletedAt = Next(), UpdatedAt = start,
                    });
                }
                foreach (var q in await db.InterviewQuestions.Select(q => q.Id).ToListAsync())
                    db.InterviewProgress.Add(new InterviewProgress { UserId = userId, QuestionId = q, Rating = InterviewRating.Confident, TimesPracticed = 1, LastPracticedAt = Next() });
            }

            var projects = await db.Projects.Select(p => p.Id).ToListAsync();
            foreach (var t in await db.ProjectTasks.Select(t => t.Id).ToListAsync())
                db.ProjectTaskProgress.Add(new ProjectTaskProgress { UserId = userId, ProjectTaskId = t, Status = ProjectTaskStatus.Completed, CompletedAt = Next(), UpdatedAt = start });
            if (withEvidence)
            {
                var items = await db.PortfolioChecklistItems.Select(i => i.Id).ToListAsync();
                var criteria = DevPath.Api.Services.Skills.SkillRules.Load().ReviewCriteria.Select(c => c.Key).ToList();
                foreach (var p in projects)
                {
                    db.ProjectRepositories.Add(new ProjectRepository { UserId = userId, ProjectId = p, RepositoryUrl = $"https://github.com/me/p{p}", UpdatedAt = start });
                    db.ProjectAssessments.Add(new ProjectAssessment
                    {
                        UserId = userId, ProjectId = p, Verification = VerificationTier.SelfReported, UpdatedAt = start,
                        Scores = System.Text.Json.JsonSerializer.Serialize(criteria.ToDictionary(c => c, _ => 4)),
                    });
                    foreach (var i in items)
                        db.PortfolioChecks.Add(new PortfolioCheck { UserId = userId, ProjectId = p, ChecklistItemId = i, IsDone = true, UpdatedAt = start });
                }
            }
            await db.SaveChangesAsync();
        }

        var level = await Level(client);
        var unmet = level["levels"]!.AsArray().SelectMany(l => l!["requirements"]!.AsArray()
            .Where(r => !r!["met"]!.GetValue<bool>()).Select(r => $"{l["key"]}: {r!.ToJsonString()}"));
        Assert.True(expected == level["level"]!.GetValue<string>(), $"{level["level"]} xp={level["xp"]} overall={level["overall"]}\n{string.Join('\n', unmet)}");
        if (!withEvidence)
        {
            // Plenty of points from ticking boxes, but the competencies don't follow.
            Assert.True(level["xpAheadOfSkills"]!.GetValue<bool>());
            Assert.NotEqual("beginner", level["xpLevel"]!.GetValue<string>());
        }
    }

    [Fact]
    public async Task Each_learner_sees_only_their_own_points()
    {
        var a = await factory.CreateUserClientAsync();
        var b = await factory.CreateUserClientAsync();
        (await SetTopic(a, await FirstTopicAsync(), "Completed")).EnsureSuccessStatusCode();
        Assert.True((await Level(a))["xp"]!.GetValue<int>() > 0);
        Assert.Equal(0, (await Level(b))["xp"]!.GetValue<int>());
        Assert.Equal(0, (await Json(await b.GetAsync("/api/skill-level/history")))["total"]!.GetValue<int>());
    }

    [Fact]
    public async Task History_lists_every_change_newest_first()
    {
        var client = await factory.CreateUserClientAsync();
        var topic = await FirstTopicAsync();
        (await SetTopic(client, topic, "Completed")).EnsureSuccessStatusCode();
        await Level(client);
        (await SetTopic(client, topic, "NotStarted")).EnsureSuccessStatusCode();
        await Level(client);

        var history = await Json(await client.GetAsync("/api/skill-level/history?pageSize=5"));
        var items = history["items"]!.AsArray();
        Assert.Equal(2, history["total"]!.GetValue<int>());
        Assert.True(items[0]!["points"]!.GetValue<int>() < 0);
        Assert.Equal("SelfReported", items[1]!["verification"]!.GetValue<string>());
        Assert.Equal("TopicCompleted", items[1]!["activity"]!.GetValue<string>());
    }

    [Fact]
    public async Task Project_review_is_validated_and_counts_only_for_a_finished_project()
    {
        var client = await factory.CreateUserClientAsync();
        int projectId;
        using (var scope = factory.Services.CreateScope())
            projectId = await scope.ServiceProvider.GetRequiredService<AppDbContext>().Projects.OrderBy(p => p.Order).Select(p => p.Id).FirstAsync();

        var empty = await Json(await client.GetAsync($"/api/projects/{projectId}/assessment"));
        Assert.Equal(10, empty["criteria"]!.AsArray().Count);
        Assert.False(empty["countsTowardsLevel"]!.GetValue<bool>());

        Assert.Equal(HttpStatusCode.BadRequest,
            (await client.PutAsJsonAsync($"/api/projects/{projectId}/assessment", new { scores = new Dictionary<string, int> { ["vibes"] = 3 } })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest,
            (await client.PutAsJsonAsync($"/api/projects/{projectId}/assessment", new { scores = new Dictionary<string, int> { ["testing"] = 5 } })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,
            (await client.PutAsJsonAsync("/api/projects/999999/assessment", new { scores = new Dictionary<string, int>() })).StatusCode);

        var saved = await Json(await client.PutAsJsonAsync($"/api/projects/{projectId}/assessment",
            new { scores = new Dictionary<string, int> { ["architecture"] = 4, ["testing"] = 3 }, notes = "Layered, tests for services." }));
        Assert.Equal(4, saved["scores"]!["architecture"]!.GetValue<int>());
        Assert.Equal("SelfReported", saved["verification"]!.GetValue<string>());

        // The project isn't finished, so the review earns nothing yet.
        var level = await Level(client);
        Assert.Equal(0, level["xp"]!.GetValue<int>());
    }

    [Fact]
    public async Task Rules_are_published_and_the_endpoints_need_a_signed_in_account()
    {
        var client = await factory.CreateUserClientAsync();
        var rules = await Json(await client.GetAsync("/api/skill-level/rules"));
        Assert.Equal(12000, rules["levels"]!.AsArray().Last()!["minXp"]!.GetValue<int>());
        Assert.Equal(40, rules["evidenceWeights"]!["Project"]!.GetValue<double>());

        var anonymous = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/skill-level")).StatusCode);
    }
}
