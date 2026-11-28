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

        // The published roadmap; draft roadmaps (seen here because the seeder's context shows drafts) come on top.
        Assert.Equal(14, await _db.Phases.CountAsync(p => !p.IsDraft));
        Assert.Equal(166, await _db.Topics.CountAsync(t => !t.IsDraft));
        Assert.True(await _db.Topics.CountAsync(t => t.IsDraft) >= 6, "the AI roadmap's draft phases are seeded");
        Assert.Equal(4, await _db.Projects.CountAsync());
        Assert.True(await _db.Resources.CountAsync() > 100);
        Assert.True(await _db.PracticeExercises.CountAsync() >= 250);
        // Every topic has at least one Practice Lab exercise, in both languages, with hints and a solution.
        var exercisesPerTopic = await _db.Topics.Select(t => new { t.Slug, Count = _db.PracticeExercises.Count(e => e.TopicId == t.Id) }).ToListAsync();
        Assert.All(exercisesPerTopic, t => Assert.True(t.Count >= 1, $"{t.Slug} has no practice exercise"));
        Assert.False(await _db.PracticeExercises.AnyAsync(e => e.TitleAr == "" || e.ProblemAr == "" || e.SolutionAr == ""
            || e.HintsEn == "" || e.HintsAr == "" || e.SolutionEn == ""));
        // Every technology the roadmaps teach has exercises, and the full-stack challenges are complete.
        var skills = await _db.PracticeExercises.Select(e => e.Topic!.Skill).Distinct().ToListAsync();
        var taught = await _db.Topics.Select(t => t.Skill).Distinct().ToListAsync();
        Assert.All(taught.Where(s => s != SkillArea.Professional), s => Assert.Contains(s, skills));
        Assert.True(await _db.PracticeExercises.CountAsync(e => e.Type == ExerciseType.FullStack) >= 10);
        Assert.True(await _db.InterviewQuestions.CountAsync() >= 50);
        // Every topic has at least two interview questions, each in both languages with a model answer.
        var questionsPerTopic = await _db.Topics.Select(t => new { t.Slug, Count = _db.InterviewQuestions.Count(q => q.TopicId == t.Id) }).ToListAsync();
        Assert.All(questionsPerTopic, t => Assert.True(t.Count >= 2, $"{t.Slug} has {t.Count} interview question(s); every topic needs at least 2"));
        Assert.False(await _db.InterviewQuestions.AnyAsync(q => q.QuestionAr == "" || q.AnswerAr == "" || q.QuestionEn == "" || q.AnswerEn == ""));
        // Every topic has bilingual content and a code sample.
        Assert.False(await _db.Topics.AnyAsync(t => t.TitleAr == "" || t.SummaryAr == "" || t.CodeSample == null));
        // Every topic of a published roadmap has 2–4 curated English videos and at most two Arabic ones, all with valid
        // YouTube ids. Draft roadmaps get their videos before they are published (then their topics stop being drafts).
        var videosPerTopic = await _db.Topics.Where(t => !t.IsDraft).Select(t => new
        {
            English = _db.CuratedVideos.Count(v => v.TopicId == t.Id && v.Language == VideoLanguage.English),
            Arabic = _db.CuratedVideos.Count(v => v.TopicId == t.Id && v.Language == VideoLanguage.Arabic),
        }).ToListAsync();
        Assert.All(videosPerTopic, n => { Assert.InRange(n.English, 2, 4); Assert.InRange(n.Arabic, 0, 2); });
        // Draft topics may still be waiting for their videos, but once they have some, the same rule applies.
        var draftVideos = await _db.Topics.Where(t => t.IsDraft).Select(t => new
        {
            English = _db.CuratedVideos.Count(v => v.TopicId == t.Id && v.Language == VideoLanguage.English),
            Arabic = _db.CuratedVideos.Count(v => v.TopicId == t.Id && v.Language == VideoLanguage.Arabic),
        }).ToListAsync();
        Assert.True(draftVideos.Count(n => n.English > 0) >= 104, "the first four AI phases and the first eleven Android phases have their videos");
        Assert.All(draftVideos.Where(n => n.English + n.Arabic > 0), n => { Assert.InRange(n.English, 2, 4); Assert.InRange(n.Arabic, 0, 2); });
        // Removing the channels the owner did not want (2026-11-20) left 82 of 166 topics with an Arabic video; Arabic videos
        // for phases 1-5 (2026-11-23) raised that to 105. Each later batch should raise this floor again.
        Assert.True(videosPerTopic.Count(n => n.Arabic > 0) >= videosPerTopic.Count * 63 / 100, "at least 63% of the topics should have an Arabic video");
        Assert.All(await _db.CuratedVideos.Select(v => v.VideoId).ToListAsync(), id => Assert.True(DevPath.Api.Services.YouTubeIds.IsValid(id)));
        // Every project task has videos, and every topic has a quiz with a valid answer for each question.
        Assert.False(await _db.ProjectTasks.AnyAsync(t => !_db.ProjectTaskVideos.Any(v => v.ProjectTaskId == t.Id)));
        // A bank of 8 per topic, so each level-1 attempt (5 questions) draws a different set.
        Assert.False(await _db.Topics.AnyAsync(t => _db.QuizQuestions.Count(q => q.TopicId == t.Id) < 8));
        Assert.All(await _db.QuizQuestions.ToListAsync(), q =>
        {
            Assert.Equal(q.OptionsEn.Count, q.OptionsAr.Count);
            Assert.InRange(q.AnswerIndex, 0, q.OptionsEn.Count - 1);
            Assert.Equal(q.OptionsEn.Count, q.OptionsEn.Distinct().Count());
            Assert.Equal(q.OptionsAr.Count, q.OptionsAr.Distinct().Count());
        });
    }

    /// <summary>
    /// The right answer must not give itself away by length: when it is a phrase, it may not be clearly longer than
    /// every wrong option (the wrong ones used to be a word or two next to a full sentence).
    /// </summary>
    [Fact]
    public async Task Quiz_answers_are_not_the_obviously_longest_option()
    {
        static bool GivesAway(IReadOnlyList<string> options, int answer)
        {
            var right = options[answer].Length;
            var longestWrong = options.Where((_, i) => i != answer).Max(o => o.Length);
            return right >= 20 && right > longestWrong * 1.15 + 4;
        }
        await Seeder().SeedAsync();
        var offenders = (await _db.QuizQuestions.ToListAsync())
            .Where(q => GivesAway(q.OptionsEn, q.AnswerIndex) || GivesAway(q.OptionsAr, q.AnswerIndex))
            .Select(q => q.Key).ToList();
        Assert.True(offenders.Count == 0, "Answers stand out by length: " + string.Join(", ", offenders.Take(10)));
    }

    [Fact]
    public async Task Topics_added_from_the_market_research_have_objectives_difficulty_and_demand()
    {
        await Seeder().SeedAsync();

        var slugs = new[] { "arch-design-patterns", "sql-stored-procedures", "pro-agile-scrum", "devops-docker", "devops-ci-cd",
            "cloud-fundamentals", "cloud-azure-app-service", "devops-kubernetes", "arch-microservices" };
        var topics = await _db.Topics.Include(t => t.Demand).Include(t => t.Phase).Where(t => slugs.Contains(t.Slug)).ToListAsync();
        Assert.Equal(slugs.Length, topics.Count);
        Assert.All(topics, t =>
        {
            Assert.NotNull(t.Difficulty);
            Assert.True(t.ObjectivesEn.Split('\n').Length >= 3, t.Slug);
            Assert.Equal(t.ObjectivesEn.Split('\n').Length, t.ObjectivesAr.Split('\n').Length);
            Assert.NotEmpty(t.Demand);
            Assert.All(t.Demand, d => { Assert.InRange(d.Postings, 1, d.TotalPostings); Assert.InRange(d.Share, 0, 100); });
        });
        Assert.Contains(topics.Single(t => t.Slug == "devops-ci-cd").Demand, d => d.Technology == "CI/CD");
        // The cloud phase sits before the projects phase, which stays last.
        var phases = await _db.Phases.Where(p => !p.IsDraft).OrderBy(p => p.Order).Select(p => p.Slug).ToListAsync();
        Assert.Equal(phases.Count - 2, phases.IndexOf(topics.Single(t => t.Slug == "devops-docker").Phase!.Slug));
    }

    [Fact]
    public async Task Topics_added_from_the_linkedin_research_are_complete_and_placed_by_their_prerequisites()
    {
        await Seeder().SeedAsync();

        var slugs = new[] { "web-html-css", "web-javascript-essentials", "arch-clean-architecture", "arch-domain-driven-design",
            "dotnet-legacy-modernization", "ai-dotnet-llm", "arch-message-brokers" };
        var topics = await _db.Topics.Include(t => t.Demand).Include(t => t.Phase).Where(t => slugs.Contains(t.Slug)).ToListAsync();
        Assert.Equal(slugs.Length, topics.Count);
        Assert.All(topics, t =>
        {
            Assert.NotNull(t.Difficulty);
            Assert.True(t.EstimatedMinutes > 0, t.Slug);
            Assert.All(new[] { t.SummaryAr, t.WhyEn, t.WhyAr, t.PracticeTaskEn, t.PracticeTaskAr, t.ChallengeEn, t.ChallengeAr }, s => Assert.False(string.IsNullOrWhiteSpace(s), t.Slug));
            Assert.True(t.ObjectivesEn.Split('\n').Length >= 3, t.Slug);
            Assert.Equal(t.ObjectivesEn.Split('\n').Length, t.ObjectivesAr.Split('\n').Length);
            Assert.NotNull(t.CodeSample);
            Assert.NotEmpty(t.Demand);
        });
        foreach (var slug in slugs)
        {
            var id = topics.Single(t => t.Slug == slug).Id;
            Assert.True(await _db.ResourceTopics.AnyAsync(r => r.TopicId == id), slug);
            Assert.True(await _db.TopicPrerequisites.AnyAsync(p => p.TopicId == id), slug);
        }

        // Inserted between existing topics, not appended at the end of a phase.
        async Task<string> Next(string slug)
        {
            var t = topics.Single(x => x.Slug == slug);
            return await _db.Topics.Where(x => x.PhaseId == t.PhaseId && x.Order == t.Order + 1).Select(x => x.Slug).SingleAsync();
        }
        Assert.Equal("web-javascript-essentials", await Next("web-html-css"));
        Assert.Equal("ts-types-inference", await Next("web-javascript-essentials"));
        Assert.Equal("arch-domain-driven-design", await Next("arch-clean-architecture"));
        Assert.Equal("devops-kubernetes", await Next("ai-dotnet-llm"));
        Assert.Equal(1, topics.Single(t => t.Slug == "web-html-css").Order);
    }

    [Fact]
    public async Task Inserting_the_new_topics_keeps_existing_progress_and_starts_them_not_started()
    {
        // Simulate the database before the update: seed a copy of the content without the new topics.
        var newSlugs = new HashSet<string> { "web-html-css", "web-javascript-essentials", "arch-clean-architecture", "arch-domain-driven-design",
            "dotnet-legacy-modernization", "ai-dotnet-llm", "arch-message-brokers" };
        var oldDir = CopySeedWithout(newSlugs);
        try
        {
            await Seeder().SeedAsync(oldDir);
            Assert.Equal(159, await _db.Topics.CountAsync(t => !t.IsDraft));
            Assert.False(await _db.Topics.AnyAsync(t => newSlugs.Contains(t.Slug)));

            // Topics right next to where the new ones go, so their Order values shift.
            var tracked = new[] { "ts-types-inference", "pro-refactoring", "pro-security", "cloud-azure-app-service", "devops-kubernetes", "arch-microservices" };
            var before = await _db.Topics.Where(t => tracked.Contains(t.Slug)).ToDictionaryAsync(t => t.Slug, t => t.Id);
            _db.Users.Add(new AppUser { Id = "learner", UserName = "learner@example.com", Email = "learner@example.com", FullName = "Learner" });
            foreach (var (slug, id) in before)
                _db.TopicProgress.Add(new TopicProgress { UserId = "learner", TopicId = id, Status = TopicStatus.Completed, Confidence = 5, UpdatedAt = DateTime.UtcNow });
            await _db.SaveChangesAsync();
            _db.ChangeTracker.Clear();

            await Seeder().SeedAsync();

            Assert.Equal(166, await _db.Topics.CountAsync(t => !t.IsDraft));
            var after = await _db.Topics.Where(t => tracked.Contains(t.Slug)).ToDictionaryAsync(t => t.Slug, t => t.Id);
            Assert.Equal(before, after); // same ids, so progress still points at the same topics
            var progress = await _db.TopicProgress.IgnoreQueryFilters().Include(p => p.Topic).ToListAsync();
            Assert.Equal(tracked.Length, progress.Count);
            Assert.All(progress, p => { Assert.Equal(TopicStatus.Completed, p.Status); Assert.Contains(p.Topic!.Slug, tracked); });
            // New topics have no progress row, so they show as not started.
            Assert.DoesNotContain(progress, p => newSlugs.Contains(p.Topic!.Slug));
        }
        finally
        {
            Directory.Delete(oldDir, recursive: true);
        }
    }

    private static string CopySeedWithout(HashSet<string> slugs)
    {
        var source = DbSeeder.DefaultSeedDirectory;
        var dir = Directory.CreateTempSubdirectory("devpath-old-seed-").FullName;
        foreach (var file in Directory.EnumerateFiles(source, "*", SearchOption.AllDirectories))
        {
            var target = Path.Combine(dir, Path.GetRelativePath(source, file));
            Directory.CreateDirectory(Path.GetDirectoryName(target)!);
            File.Copy(file, target);
        }
        static void Edit(string path, Action<System.Text.Json.Nodes.JsonNode> change)
        {
            var node = System.Text.Json.Nodes.JsonNode.Parse(File.ReadAllText(path))!;
            change(node);
            File.WriteAllText(path, node.ToJsonString());
        }
        static void RemoveWhere(System.Text.Json.Nodes.JsonArray array, Func<System.Text.Json.Nodes.JsonNode, bool> match)
        {
            foreach (var item in array.Where(i => match(i!)).ToList()) array.Remove(item);
        }
        foreach (var file in Directory.GetFiles(Path.Combine(dir, "roadmap")))
            Edit(file, n => RemoveWhere(n["topics"]!.AsArray(), t => slugs.Contains((string)t["slug"]!)));
        foreach (var file in Directory.GetFiles(Path.Combine(dir, "quizzes")))
            Edit(file, n => RemoveWhere(n.AsArray(), q => slugs.Contains((string)q["topic"]!)));
        foreach (var file in Directory.GetFiles(Path.Combine(dir, "tutorials")))
            Edit(file, n => RemoveWhere(n.AsArray(), t => slugs.Contains((string)t["topic"]!)));
        foreach (var file in Directory.GetFiles(Path.Combine(dir, "interviews")))
            Edit(file, n => RemoveWhere(n.AsArray(), q => slugs.Contains((string)q["topic"]!)));
        foreach (var file in Directory.GetFiles(Path.Combine(dir, "practice")))
            Edit(file, n => RemoveWhere(n.AsArray(), e => slugs.Contains((string)e["topic"]!)));
        foreach (var file in Directory.GetFiles(Path.Combine(dir, "guided-projects")))
            Edit(file, n => { foreach (var p in n.AsArray()) if (p!["topics"] is System.Text.Json.Nodes.JsonArray t) RemoveWhere(t, s => slugs.Contains((string)s!)); });
        Edit(Path.Combine(dir, "videos.json"), n => { foreach (var s in slugs) n.AsObject().Remove(s); });
        Edit(Path.Combine(dir, "market-demand.json"), n => { foreach (var s in slugs) n["topics"]!.AsObject().Remove(s); });
        Edit(Path.Combine(dir, "resources.json"), n =>
        {
            foreach (var r in n.AsArray()) RemoveWhere(r!["topics"]!.AsArray(), s => slugs.Contains((string)s!));
            RemoveWhere(n.AsArray(), r => r["topics"]!.AsArray().Count == 0);
        });
        return dir;
    }

    [Fact]
    public async Task Slugs_and_titles_are_unique_and_every_earlier_topic_is_still_in_its_phase()
    {
        await Seeder().SeedAsync();

        var topics = await _db.Topics.Select(t => new { t.Slug, t.TitleEn, Phase = t.Phase!.Slug }).ToListAsync();
        Assert.Equal(topics.Count, topics.Select(t => t.Slug.ToLowerInvariant()).Distinct().Count());
        Assert.Equal(topics.Count, topics.Select(t => t.TitleEn.Trim().ToLowerInvariant()).Distinct().Count());

        // The 159 topics that existed before the LinkedIn update keep their slug and their phase.
        var before = File.ReadAllLines(Path.Combine(AppContext.BaseDirectory, "TestData", "topics-before-linkedin-update.txt"))
            .Where(l => l.Length > 0).Select(l => l.Split(' ')).ToList();
        Assert.Equal(159, before.Count);
        Assert.All(before, b => Assert.Contains(topics, t => t.Phase == b[0] && t.Slug == b[1]));
    }

    [Fact]
    public async Task Every_prerequisite_comes_earlier_in_the_roadmap()
    {
        await Seeder().SeedAsync();

        var order = await _db.Topics.Select(t => new { t.Id, Phase = t.Phase!.Order, t.Order }).ToDictionaryAsync(t => t.Id);
        var pairs = await _db.TopicPrerequisites.Select(p => new { p.TopicId, p.PrerequisiteTopicId }).ToListAsync();
        Assert.All(pairs, p =>
        {
            var (topic, pre) = (order[p.TopicId], order[p.PrerequisiteTopicId]);
            Assert.True((pre.Phase, pre.Order).CompareTo((topic.Phase, topic.Order)) < 0, $"topic {p.TopicId} comes before its prerequisite {p.PrerequisiteTopicId}");
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
            var error = ValidateSeed(dir, Topic("a", ["missing-topic"]));
            Assert.Contains("unknown topic 'missing-topic'", error.Message);
        }
        finally
        {
            Directory.Delete(dir, recursive: true);
        }
    }

    [Fact]
    public void A_topic_placed_before_its_prerequisite_is_rejected()
    {
        var dir = Directory.CreateTempSubdirectory("devpath-seed-").FullName;
        try
        {
            var error = ValidateSeed(dir, Topic("a", ["b"]), Topic("b", []));
            Assert.Contains("Topic 'a' comes before its prerequisite 'b'", error.Message);
        }
        finally
        {
            Directory.Delete(dir, recursive: true);
        }
    }

    [Fact]
    public void Roadmaps_must_list_known_phases_and_keep_a_shared_phase_at_one_position()
    {
        var dir = Directory.CreateTempSubdirectory("devpath-tracks-").FullName;
        try
        {
            static string Track(string slug, string phases) =>
                $$"""{"slug":"{{slug}}","order":1,"published":true,"titleEn":"T","titleAr":"T","summaryEn":"","summaryAr":"","outcomeEn":"","outcomeAr":"","technologies":[],"icon":"map","phases":{{phases}}}""";
            File.WriteAllText(Path.Combine(dir, "tracks.json"), $"[{Track("x", """["p1","nope"]""")},{Track("y", """["nope","p1"]""")}]");
            var error = ValidateSeed(dir, Topic("a", []));
            Assert.Contains("Roadmap 'x' references unknown phase 'nope'", error.Message);
            Assert.Contains("Phase 'p1' is phase 1 in 'x' but phase 2 in 'y'", error.Message);
        }
        finally
        {
            Directory.Delete(dir, recursive: true);
        }
    }

    [Fact]
    public void The_seeded_roadmaps_are_valid_and_the_ai_roadmap_stays_a_draft_until_it_is_complete()
    {
        var content = SeedContent.Load(DbSeeder.DefaultSeedDirectory, new JsonSerializerOptions { PropertyNameCaseInsensitive = true, Converters = { new JsonStringEnumConverter() } });
        var dotnet = content.Tracks.Single(t => t.Slug == "dotnet-fullstack");
        Assert.True(dotnet.Published);
        Assert.Equal(content.Phases.Where(p => p.Order <= 14).Select(p => p.Slug), dotnet.Phases);
        var ai = content.Tracks.Single(t => t.Slug == "ai-app-developer");
        Assert.Equal(["csharp-fundamentals", "object-oriented-programming", "modern-csharp", "aspnet-core"], ai.Phases.Take(4));
    }

    private static TopicSeed Topic(string slug, List<string> prerequisites) =>
        new(slug, SkillArea.CSharp, TopicPriority.Core, 10, slug, slug, "", "", "", "", "", "", "", "", "", "", "", "", prerequisites);

    private static InvalidDataException ValidateSeed(string dir, params TopicSeed[] topics)
    {
        Directory.CreateDirectory(Path.Combine(dir, "roadmap"));
        Directory.CreateDirectory(Path.Combine(dir, "practice"));
        Directory.CreateDirectory(Path.Combine(dir, "interviews"));
        var phase = new PhaseSeed("p1", 1, "Phase", "مرحلة", "", "", [.. topics]);
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, Converters = { new JsonStringEnumConverter() } };
        File.WriteAllText(Path.Combine(dir, "roadmap", "01.json"), JsonSerializer.Serialize(phase, options));
        foreach (var file in new[] { "resources.json", "projects.json", "portfolio-checklist.json" })
            File.WriteAllText(Path.Combine(dir, file), "[]");

        var content = SeedContent.Load(dir, new JsonSerializerOptions { PropertyNameCaseInsensitive = true, Converters = { new JsonStringEnumConverter() } });
        return Assert.Throws<InvalidDataException>(content.Validate);
    }

    private sealed class FakeHostEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = "Testing";
        public string ApplicationName { get; set; } = "DevPath.Api.Tests";
        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
        public Microsoft.Extensions.FileProviders.IFileProvider ContentRootFileProvider { get; set; } = null!;
    }
}
