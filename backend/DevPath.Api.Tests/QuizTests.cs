using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>Topic quizzes and project task videos through the HTTP API.</summary>
public class QuizTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response) =>
        JsonNode.Parse(await response.Content.ReadAsStringAsync())!;

    private async Task<(int First, int Later)> TopicIdsAsync()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var ids = await db.Topics.OrderBy(t => t.Phase.Order).ThenBy(t => t.Order).Select(t => t.Id).ToListAsync();
        return (ids[0], ids[20]);
    }

    /// <summary>The correct option for each question, read straight from the database.</summary>
    private async Task<Dictionary<int, int>> AnswersAsync()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db.QuizQuestions.ToDictionaryAsync(q => q.Id, q => q.AnswerIndex);
    }

    private static object Submission(int level, JsonNode quiz, Func<int, int> choose) => new
    {
        level,
        answers = quiz["questions"]!.AsArray().Select(q => q!["id"]!.GetValue<int>()).Select(id => new { questionId = id, choice = choose(id) }),
    };

    [Fact]
    public async Task Questions_are_served_without_answers()
    {
        var client = await factory.CreateUserClientAsync();
        var (_, topic) = await TopicIdsAsync();
        var response = await client.GetAsync($"/api/topics/{topic}/quiz");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var text = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("answerIndex", text, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("explanation", text, StringComparison.OrdinalIgnoreCase);
        var json = JsonNode.Parse(text)!;
        Assert.True(json["questions"]!.AsArray().Count >= 3);
        Assert.All(json["questions"]!.AsArray(), q => Assert.Equal(topic, q!["topicId"]!.GetValue<int>()));
    }

    [Fact]
    public async Task Answers_are_graded_and_levels_unlock_in_order()
    {
        var client = await factory.CreateUserClientAsync();
        var (_, topic) = await TopicIdsAsync();
        var answers = await AnswersAsync();

        // Level 2 is locked until level 1 is passed.
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync($"/api/topics/{topic}/quiz?level=2")).StatusCode);

        // A failed attempt is recorded but doesn't unlock anything.
        var quiz = await Json(await client.GetAsync($"/api/topics/{topic}/quiz?level=1"));
        var failed = await Json(await client.PostAsJsonAsync($"/api/topics/{topic}/quiz", Submission(1, quiz, id => (answers[id] + 1) % 4)));
        Assert.Equal(0, failed["score"]!.GetValue<int>());
        Assert.False(failed["passed"]!.GetValue<bool>());
        Assert.All(failed["results"]!.AsArray(), r => Assert.False(string.IsNullOrEmpty(r!["explanationEn"]!.GetValue<string>())));
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync($"/api/topics/{topic}/quiz?level=2")).StatusCode);

        // All correct passes level 1 and opens level 2, which mixes in earlier topics.
        var passed = await Json(await client.PostAsJsonAsync($"/api/topics/{topic}/quiz", Submission(1, quiz, id => answers[id])));
        Assert.True(passed["passed"]!.GetValue<bool>());
        Assert.True(passed["levels"]!.AsArray()[1]!["unlocked"]!.GetValue<bool>());
        var level2 = await Json(await client.GetAsync($"/api/topics/{topic}/quiz?level=2"));
        var topics = level2["questions"]!.AsArray().Select(q => q!["topicId"]!.GetValue<int>()).Distinct().ToList();
        Assert.Contains(topic, topics);
        Assert.True(topics.Count > 1);

        // Level 3 still needs level 2.
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync($"/api/topics/{topic}/quiz?level=3")).StatusCode);
        await client.PostAsJsonAsync($"/api/topics/{topic}/quiz", Submission(2, level2, id => answers[id]));
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync($"/api/topics/{topic}/quiz?level=3")).StatusCode);
    }

    [Fact]
    public async Task Submissions_must_answer_this_quiz_exactly_once()
    {
        var client = await factory.CreateUserClientAsync();
        var (first, topic) = await TopicIdsAsync();
        var quiz = await Json(await client.GetAsync($"/api/topics/{topic}/quiz"));
        var ids = quiz["questions"]!.AsArray().Select(q => q!["id"]!.GetValue<int>()).ToList();
        var foreign = (await Json(await client.GetAsync($"/api/topics/{first}/quiz")))["questions"]!.AsArray()[0]!["id"]!.GetValue<int>();

        async Task<HttpStatusCode> Post(IEnumerable<int> questionIds, int choice = 0) =>
            (await client.PostAsJsonAsync($"/api/topics/{topic}/quiz",
                new { level = 1, answers = questionIds.Select(id => new { questionId = id, choice }) })).StatusCode;

        Assert.Equal(HttpStatusCode.BadRequest, await Post(ids.Skip(1).Append(foreign)));  // another topic's question
        Assert.Equal(HttpStatusCode.BadRequest, await Post(ids.Skip(1).Append(ids[1])));   // the same question twice
        Assert.Equal(HttpStatusCode.BadRequest, await Post(ids.Skip(1)));                   // one missing
        Assert.Equal(HttpStatusCode.BadRequest, await Post(ids, choice: 9));                // no such option
        Assert.Equal(HttpStatusCode.OK, await Post(ids));
    }

    [Fact]
    public async Task The_first_topic_has_no_review_levels()
    {
        var client = await factory.CreateUserClientAsync();
        var (first, _) = await TopicIdsAsync();
        var quiz = await Json(await client.GetAsync($"/api/topics/{first}/quiz"));
        var levels = quiz["levels"]!.AsArray();
        Assert.True(levels[0]!["available"]!.GetValue<bool>());
        Assert.False(levels[1]!["available"]!.GetValue<bool>());
        Assert.False(levels[2]!["available"]!.GetValue<bool>());
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/topics/{first}/quiz?level=2")).StatusCode);
    }

    [Fact]
    public async Task Attempts_are_private_to_each_account()
    {
        var (_, topic) = await TopicIdsAsync();
        var answers = await AnswersAsync();
        var a = await factory.CreateUserClientAsync();
        var quiz = await Json(await a.GetAsync($"/api/topics/{topic}/quiz"));
        await a.PostAsJsonAsync($"/api/topics/{topic}/quiz", Submission(1, quiz, id => answers[id]));

        var b = await factory.CreateUserClientAsync();
        var level1 = (await Json(await b.GetAsync($"/api/topics/{topic}/quiz")))["levels"]!.AsArray()[0]!;
        Assert.Equal(0, level1["attempts"]!.GetValue<int>());
        Assert.False(level1["passed"]!.GetValue<bool>());
        Assert.Equal(HttpStatusCode.Forbidden, (await b.GetAsync($"/api/topics/{topic}/quiz?level=2")).StatusCode);
    }

    [Fact]
    public async Task Quizzes_and_task_videos_require_sign_in()
    {
        var anonymous = factory.CreateClient();
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/topics/1/quiz")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/project-tasks/1/videos")).StatusCode);
    }

    [Fact]
    public async Task Every_project_task_has_at_least_three_videos()
    {
        var client = await factory.CreateUserClientAsync();
        using var scope = factory.Services.CreateScope();
        var taskIds = await scope.ServiceProvider.GetRequiredService<AppDbContext>().ProjectTasks.Select(t => t.Id).ToListAsync();
        foreach (var id in taskIds)
        {
            var json = await Json(await client.GetAsync($"/api/project-tasks/{id}/videos"));
            var videos = json["videos"]!.AsArray();
            Assert.True(videos.Count >= 3, $"task {id} has {videos.Count} videos");
            Assert.Equal(videos.Count, videos.Select(v => v!["videoId"]!.GetValue<string>()).Distinct().Count());
            Assert.True(json["progressTopicId"]!.GetValue<int>() > 0);
        }
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/project-tasks/999999/videos")).StatusCode);
    }
}
