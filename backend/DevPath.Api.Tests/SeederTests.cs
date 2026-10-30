using System.Text.Json;
using System.Text.Json.Serialization;
using DevPath.Api.Data;
using DevPath.Api.Data.Seeding;
using DevPath.Api.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;

namespace DevPath.Api.Tests;

public class SeederTests : IAsyncLifetime
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");
    private AppDbContext _db = null!;

    public async Task InitializeAsync()
    {
        await _connection.OpenAsync();
        _db = new AppDbContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options);
        await _db.Database.EnsureCreatedAsync();
    }

    public async Task DisposeAsync()
    {
        await _db.DisposeAsync();
        await _connection.DisposeAsync();
    }

    private DbSeeder Seeder() => new(_db, NullLogger<DbSeeder>.Instance, new FakeHostEnvironment());

    [Fact]
    public async Task Seeds_the_full_roadmap()
    {
        await Seeder().SeedAsync();

        Assert.Equal(13, await _db.Phases.CountAsync());
        Assert.Equal(150, await _db.Topics.CountAsync());
        Assert.Equal(4, await _db.Projects.CountAsync());
        Assert.True(await _db.Resources.CountAsync() > 100);
        Assert.True(await _db.PracticeExercises.CountAsync() >= 30);
        Assert.True(await _db.InterviewQuestions.CountAsync() >= 50);
        // Every topic has bilingual content and a code sample.
        Assert.False(await _db.Topics.AnyAsync(t => t.TitleAr == "" || t.SummaryAr == "" || t.CodeSample == null));
        // Every topic has at least two curated videos with valid YouTube ids.
        var videosPerTopic = await _db.Topics.Select(t => _db.CuratedVideos.Count(v => v.TopicId == t.Id)).ToListAsync();
        Assert.All(videosPerTopic, n => Assert.InRange(n, 2, 4));
        Assert.All(await _db.CuratedVideos.Select(v => v.VideoId).ToListAsync(), id => Assert.True(DevPath.Api.Services.YouTubeIds.IsValid(id)));
        // Every project task has videos, and every topic has a quiz with a valid answer for each question.
        Assert.False(await _db.ProjectTasks.AnyAsync(t => !_db.ProjectTaskVideos.Any(v => v.ProjectTaskId == t.Id)));
        Assert.False(await _db.Topics.AnyAsync(t => _db.QuizQuestions.Count(q => q.TopicId == t.Id) < 3));
        Assert.All(await _db.QuizQuestions.ToListAsync(), q =>
        {
            Assert.Equal(q.OptionsEn.Count, q.OptionsAr.Count);
            Assert.InRange(q.AnswerIndex, 0, q.OptionsEn.Count - 1);
        });
    }

    [Fact]
    public async Task Seeding_twice_creates_no_duplicates_and_keeps_user_progress()
    {
        await Seeder().SeedAsync();
        var topic = await _db.Topics.FirstAsync();
        _db.Users.Add(new AppUser { Id = "learner", UserName = "learner@example.com", Email = "learner@example.com", FullName = "Learner" });
        _db.TopicProgress.Add(new TopicProgress { UserId = "learner", TopicId = topic.Id, Status = TopicStatus.Completed, Confidence = 4, UpdatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();
        var counts = await Counts();

        _db.ChangeTracker.Clear();
        await Seeder().SeedAsync();

        Assert.Equal(counts, await Counts());
        // This context has no signed-in user, so the user-data filter would hide the row.
        var progress = await _db.TopicProgress.IgnoreQueryFilters().SingleAsync();
        Assert.Equal(TopicStatus.Completed, progress.Status);
        Assert.Equal(4, progress.Confidence);
    }

    private async Task<(int, int, int, int, int, int)> Counts() => (
        await _db.Topics.CountAsync(), await _db.TopicPrerequisites.CountAsync(), await _db.Resources.CountAsync(),
        await _db.ResourceTopics.CountAsync(), await _db.ProjectTasks.CountAsync(), await _db.InterviewQuestions.CountAsync());

    [Fact]
    public void Invalid_seed_data_is_rejected_with_a_clear_message()
    {
        var dir = Directory.CreateTempSubdirectory("devpath-seed-").FullName;
        try
        {
            Directory.CreateDirectory(Path.Combine(dir, "roadmap"));
            Directory.CreateDirectory(Path.Combine(dir, "practice"));
            Directory.CreateDirectory(Path.Combine(dir, "interviews"));
            var phase = new PhaseSeed("p1", 1, "Phase", "مرحلة", "", "",
                [new TopicSeed("a", SkillArea.CSharp, TopicPriority.Core, 10, "A", "أ", "", "", "", "", "", "", "", "", "", "", "", "", ["missing-topic"])]);
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, Converters = { new JsonStringEnumConverter() } };
            File.WriteAllText(Path.Combine(dir, "roadmap", "01.json"), JsonSerializer.Serialize(phase, options));
            foreach (var file in new[] { "resources.json", "projects.json", "portfolio-checklist.json" })
                File.WriteAllText(Path.Combine(dir, file), "[]");

            var content = SeedContent.Load(dir, new JsonSerializerOptions { PropertyNameCaseInsensitive = true, Converters = { new JsonStringEnumConverter() } });
            var error = Assert.Throws<InvalidDataException>(content.Validate);
            Assert.Contains("unknown topic 'missing-topic'", error.Message);
        }
        finally
        {
            Directory.Delete(dir, recursive: true);
        }
    }

    private sealed class FakeHostEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = "Testing";
        public string ApplicationName { get; set; } = "DevPath.Api.Tests";
        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
        public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; } = null!;
    }
}
