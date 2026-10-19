using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace DevPath.Api.Tests;

/// <summary>End-to-end HTTP tests: routing, validation, status codes, JSON and business rules.</summary>
public class ApiTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private async Task<JsonNode> Json(HttpResponseMessage response) =>
        JsonNode.Parse(await response.Content.ReadAsStringAsync())!;

    [Theory]
    [InlineData("/api/health")]
    [InlineData("/api/dashboard")]
    [InlineData("/api/roadmap")]
    [InlineData("/api/topics?page=1&pageSize=5")]
    [InlineData("/api/recommendations")]
    [InlineData("/api/study-plan?minutes=120")]
    [InlineData("/api/projects")]
    [InlineData("/api/projects/4")]
    [InlineData("/api/resources")]
    [InlineData("/api/practice")]
    [InlineData("/api/interviews")]
    [InlineData("/api/notes")]
    [InlineData("/api/reviews")]
    [InlineData("/api/progress")]
    [InlineData("/api/progress/weekly")]
    [InlineData("/api/career-readiness")]
    [InlineData("/api/preferences")]
    public async Task Read_endpoints_return_200(string url)
    {
        var response = await _client.GetAsync(url);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Roadmap_has_13_phases_and_enums_are_strings()
    {
        var json = await Json(await _client.GetAsync("/api/roadmap"));
        var phases = json["phases"]!.AsArray();
        Assert.Equal(13, phases.Count);
        Assert.Equal("NotStarted", phases[0]!["topics"]![1]!["status"]!.GetValue<string>());
    }

    [Fact]
    public async Task Unknown_topic_returns_404_problem_details_with_code()
    {
        var response = await _client.GetAsync("/api/topics/999999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("not_found", (await Json(response))["code"]!.GetValue<string>());
    }

    [Fact]
    public async Task Invalid_confidence_returns_400_with_field_error()
    {
        var response = await _client.PutAsJsonAsync("/api/topics/1/progress", new { status = "Completed", knowledge = "Unassessed", confidence = 9 });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var json = await Json(response);
        Assert.Equal("validation_failed", json["code"]!.GetValue<string>());
        Assert.NotNull(json["errors"]!["Confidence"]);
    }

    [Fact]
    public async Task Topic_progress_is_saved()
    {
        var put = await _client.PutAsJsonAsync("/api/topics/7/progress", new { status = "Completed", knowledge = "NeedReview", confidence = 3 });
        Assert.Equal(HttpStatusCode.OK, put.StatusCode);

        var topic = await Json(await _client.GetAsync("/api/topics/7"));
        Assert.Equal("Completed", topic["status"]!.GetValue<string>());
        Assert.Equal(3, topic["confidence"]!.GetValue<int>());
        Assert.NotNull(topic["completedAt"]);
    }

    [Fact]
    public async Task Notes_crud_with_validation()
    {
        var empty = await _client.PostAsJsonAsync("/api/notes", new { title = "", content = "x" });
        Assert.Equal(HttpStatusCode.BadRequest, empty.StatusCode);

        var twoLinks = await _client.PostAsJsonAsync("/api/notes", new { title = "t", topicId = 1, projectId = 1 });
        Assert.Equal(HttpStatusCode.BadRequest, twoLinks.StatusCode);

        var badLink = await _client.PostAsJsonAsync("/api/notes", new { title = "t", topicId = 999999 });
        Assert.Equal(HttpStatusCode.BadRequest, badLink.StatusCode);

        var created = await _client.PostAsJsonAsync("/api/notes", new { title = "Remember", content = "AsNoTracking", topicId = 1 });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        Assert.NotNull(created.Headers.Location);
        var id = (await Json(created))["id"]!.GetValue<int>();

        var found = await Json(await _client.GetAsync("/api/notes?q=AsNoTracking"));
        Assert.Contains(found.AsArray(), n => n!["id"]!.GetValue<int>() == id);

        Assert.Equal(HttpStatusCode.NoContent, (await _client.DeleteAsync($"/api/notes/{id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await _client.DeleteAsync($"/api/notes/{id}")).StatusCode);
    }

    [Fact]
    public async Task Solution_requires_an_attempt_first()
    {
        var early = await _client.PostAsync("/api/practice/2/solution", null);
        Assert.Equal(HttpStatusCode.Conflict, early.StatusCode);
        Assert.Equal("attempt_required", (await Json(early))["code"]!.GetValue<string>());

        var detail = await Json(await _client.GetAsync("/api/practice/2"));
        Assert.Null(detail["solutionEn"]?.GetValue<string>());   // not sent before it is revealed

        await _client.PutAsJsonAsync("/api/practice/2/attempt", new { answer = "My attempt" });
        var revealed = await _client.PostAsync("/api/practice/2/solution", null);
        Assert.Equal(HttpStatusCode.OK, revealed.StatusCode);
        Assert.False(string.IsNullOrEmpty((await Json(revealed))["solutionEn"]!.GetValue<string>()));
    }

    [Fact]
    public async Task Locked_change_request_cannot_be_started()
    {
        var project = await Json(await _client.GetAsync("/api/projects/2"));
        var locked = project["changeRequests"]!.AsArray().First(t => t!["isLocked"]!.GetValue<bool>())!;
        var response = await _client.PutAsJsonAsync($"/api/project-tasks/{locked["id"]}/progress", new { status = "InProgress" });
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("task_locked", (await Json(response))["code"]!.GetValue<string>());
    }

    [Fact]
    public async Task Blocked_task_requires_a_reason()
    {
        var response = await _client.PutAsJsonAsync("/api/project-tasks/3/progress", new { status = "Blocked" });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.NotNull((await Json(response))["errors"]!["blockedReason"]);
    }

    [Fact]
    public async Task Search_validates_and_groups_results()
    {
        Assert.Equal(HttpStatusCode.BadRequest, (await _client.GetAsync("/api/search?q=a")).StatusCode);

        var json = await Json(await _client.GetAsync("/api/search?q=linq"));
        var categories = json["groups"]!.AsArray().Select(g => g!["category"]!.GetValue<string>()).ToList();
        Assert.Contains("topics", categories);
    }

    [Fact]
    public async Task Search_finds_arabic_text()
    {
        var json = await Json(await _client.GetAsync("/api/search?q=" + Uri.EscapeDataString("المتغيرات")));
        Assert.NotEmpty(json["groups"]!.AsArray());
    }

    [Fact]
    public async Task Review_queue_add_complete_remove()
    {
        Assert.Equal(HttpStatusCode.OK, (await _client.PutAsync("/api/reviews/9", null)).StatusCode);
        var completed = await _client.PostAsJsonAsync("/api/reviews/9/complete", new { confidence = 5 });
        Assert.Equal(16, (await Json(completed))["intervalDays"]!.GetValue<int>());
        Assert.Equal(HttpStatusCode.NoContent, (await _client.DeleteAsync("/api/reviews/9")).StatusCode);
    }

    [Fact]
    public async Task Study_plan_minutes_are_validated()
    {
        Assert.Equal(HttpStatusCode.BadRequest, (await _client.GetAsync("/api/study-plan?minutes=5")).StatusCode);
        var plan = await Json(await _client.GetAsync("/api/study-plan?minutes=60"));
        Assert.Equal(60, plan["items"]!.AsArray().Sum(i => i!["minutes"]!.GetValue<int>()));
    }

    [Fact]
    public async Task Future_study_session_is_rejected()
    {
        var response = await _client.PostAsJsonAsync("/api/study-sessions",
            new { topicId = 1, actualMinutes = 30, sessionDate = DateTime.Today.AddDays(3).ToString("yyyy-MM-dd") });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("futureDate", (await Json(response))["code"]!.GetValue<string>());
    }
}
