using System.Text.Json;
using System.Text.Json.Serialization;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Data.Seeding;

/// <summary>
/// Idempotent content seeder.
///
/// * Every content row is matched by its stable Slug/Key, then inserted or updated.
///   Running it twice produces no changes the second time (EF only issues UPDATEs
///   for values that actually changed).
/// * Link tables (prerequisites, resource ↔ topic, task ↔ topic) are synchronised:
///   links removed from the JSON are removed from the database.
/// * User-owned tables (progress, notes, sessions, ...) are never touched.
/// </summary>
public class DbSeeder(AppDbContext db, ILogger<DbSeeder> logger, IHostEnvironment env)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true,
        Converters = { new JsonStringEnumConverter() }
    };

    private SnippetStore _snippets = null!;

    public static string DefaultSeedDirectory => Path.Combine(AppContext.BaseDirectory, "SeedData");

    public async Task SeedAsync(string? seedDirectory = null, CancellationToken ct = default)
    {
        var dir = seedDirectory ?? DefaultSeedDirectory;
        var content = SeedContent.Load(dir, JsonOptions);
        content.Validate();
        _snippets = new SnippetStore(Path.Combine(dir, "snippets"));

        // With connection resiliency (EnableRetryOnFailure) an explicit transaction must run
        // inside the execution strategy, so the whole unit can be retried as one.
        var strategy = db.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            db.ChangeTracker.Clear();
            await using var tx = await db.Database.BeginTransactionAsync(ct);

            var phases = await SeedPhasesAsync(content.Phases, ct);
            var topics = await SeedTopicsAsync(content.Phases, phases, ct);
            await SyncPrerequisitesAsync(content.Phases, topics, ct);
            await SeedResourcesAsync(content.Resources, topics, ct);
            await SeedProjectsAsync(content.Projects, phases, topics, ct);
            await SeedChecklistAsync(content.Checklist, ct);
            await SeedExercisesAsync(content.Exercises, topics, ct);
            await SeedInterviewsAsync(content.Interviews, topics, ct);

            await tx.CommitAsync(ct);
        });

        logger.LogInformation(
            "Seed complete ({Environment}): {Phases} phases, {Topics} topics, {Resources} resources, {Projects} projects, {Exercises} exercises, {Questions} interview questions",
            env.EnvironmentName, content.Phases.Count, content.Phases.Sum(p => p.Topics.Count), content.Resources.Count,
            content.Projects.Count, content.Exercises.Count, content.Interviews.Count);
    }

    private async Task<Dictionary<string, Phase>> SeedPhasesAsync(List<PhaseSeed> seeds, CancellationToken ct)
    {
        var existing = await db.Phases.ToDictionaryAsync(p => p.Slug, ct);
        foreach (var s in seeds)
        {
            if (!existing.TryGetValue(s.Slug, out var p))
            {
                p = new Phase { Slug = s.Slug, TitleEn = s.TitleEn, TitleAr = s.TitleAr };
                db.Phases.Add(p);
                existing[s.Slug] = p;
            }
            p.Order = s.Order;
            p.TitleEn = s.TitleEn;
            p.TitleAr = s.TitleAr;
            p.DescriptionEn = s.DescriptionEn;
            p.DescriptionAr = s.DescriptionAr;
        }
        await db.SaveChangesAsync(ct);
        return existing;
    }

    private async Task<Dictionary<string, Topic>> SeedTopicsAsync(
        List<PhaseSeed> seeds, Dictionary<string, Phase> phases, CancellationToken ct)
    {
        var existing = await db.Topics.ToDictionaryAsync(t => t.Slug, ct);
        foreach (var phase in seeds)
        {
            var order = 0;
            foreach (var s in phase.Topics)
            {
                if (!existing.TryGetValue(s.Slug, out var t))
                {
                    t = new Topic { Slug = s.Slug, TitleEn = s.TitleEn, TitleAr = s.TitleAr };
                    db.Topics.Add(t);
                    existing[s.Slug] = t;
                }
                t.PhaseId = phases[phase.Slug].Id;
                t.Order = ++order;
                t.Skill = s.Skill;
                t.Priority = s.Priority;
                t.EstimatedMinutes = s.Minutes;
                t.TitleEn = s.TitleEn;
                t.TitleAr = s.TitleAr;
                t.SummaryEn = s.SummaryEn;
                t.SummaryAr = s.SummaryAr;
                t.WhyEn = s.WhyEn;
                t.WhyAr = s.WhyAr;
                t.HowEn = s.HowEn;
                t.HowAr = s.HowAr;
                t.ExampleEn = s.ExampleEn;
                t.ExampleAr = s.ExampleAr;
                (t.CodeSample, t.CodeLanguage) = _snippets.Get("topics", s.Slug);
                t.PracticeTaskEn = s.PracticeEn;
                t.PracticeTaskAr = s.PracticeAr;
                t.ChallengeEn = s.ChallengeEn;
                t.ChallengeAr = s.ChallengeAr;
            }
        }
        await db.SaveChangesAsync(ct);
        return existing;
    }

    private async Task SyncPrerequisitesAsync(List<PhaseSeed> seeds, Dictionary<string, Topic> topics, CancellationToken ct)
    {
        var desired = seeds.SelectMany(p => p.Topics)
            .SelectMany(t => (t.Prerequisites ?? []).Select(pre => (topics[t.Slug].Id, topics[pre].Id)))
            .ToHashSet();

        var current = await db.TopicPrerequisites.ToListAsync(ct);
        db.TopicPrerequisites.RemoveRange(current.Where(c => !desired.Contains((c.TopicId, c.PrerequisiteTopicId))));
        var currentKeys = current.Select(c => (c.TopicId, c.PrerequisiteTopicId)).ToHashSet();
        foreach (var (topicId, preId) in desired.Where(d => !currentKeys.Contains(d)))
            db.TopicPrerequisites.Add(new TopicPrerequisite { TopicId = topicId, PrerequisiteTopicId = preId });

        await db.SaveChangesAsync(ct);
    }

    private async Task SeedResourcesAsync(List<ResourceSeed> seeds, Dictionary<string, Topic> topics, CancellationToken ct)
    {
        var existing = await db.Resources.Include(r => r.TopicLinks).ToDictionaryAsync(r => r.Key, ct);
        foreach (var s in seeds)
        {
            if (!existing.TryGetValue(s.Key, out var r))
            {
                r = new Resource { Key = s.Key, TitleEn = s.TitleEn, Url = s.Url, SourceName = s.Source };
                // Only record a verification that actually happened (see resources.json "checkedOn").
                if (s.CheckedOn is { } checkedOn && s.CheckedStatus is >= 200 and < 400)
                {
                    r.VerificationStatus = VerificationStatus.Verified;
                    r.LastVerifiedAt = checkedOn.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
                    r.LastStatusCode = s.CheckedStatus;
                }
                db.Resources.Add(r);
            }
            r.TitleEn = s.TitleEn;
            r.TitleAr = s.TitleAr;
            r.Url = s.Url;
            r.SourceName = s.Source;
            r.Type = s.Type;
            r.Difficulty = s.Difficulty;
            r.IsFree = s.Free;

            var wanted = s.Topics.Select(slug => topics[slug].Id).ToHashSet();
            r.TopicLinks.RemoveAll(l => !wanted.Contains(l.TopicId));
            foreach (var id in wanted.Where(id => r.TopicLinks.All(l => l.TopicId != id)))
                r.TopicLinks.Add(new ResourceTopic { TopicId = id });
        }
        await db.SaveChangesAsync(ct);
    }

    private async Task SeedProjectsAsync(
        List<ProjectSeed> seeds, Dictionary<string, Phase> phases, Dictionary<string, Topic> topics, CancellationToken ct)
    {
        var projects = await db.Projects.ToDictionaryAsync(p => p.Slug, ct);
        var milestones = await db.ProjectMilestones.ToDictionaryAsync(m => m.Key, ct);
        var tasks = await db.ProjectTasks.Include(t => t.TopicLinks).ToDictionaryAsync(t => t.Key, ct);

        foreach (var s in seeds)
        {
            if (!projects.TryGetValue(s.Slug, out var p))
            {
                p = new Project { Slug = s.Slug, TitleEn = s.TitleEn, TitleAr = s.TitleAr, TechStack = s.TechStack };
                db.Projects.Add(p);
            }
            p.Order = s.Order;
            p.TitleEn = s.TitleEn;
            p.TitleAr = s.TitleAr;
            p.SummaryEn = s.SummaryEn;
            p.SummaryAr = s.SummaryAr;
            p.RequirementsEn = string.Join('\n', s.RequirementsEn);
            p.RequirementsAr = string.Join('\n', s.RequirementsAr);
            p.TechStack = s.TechStack;
            p.StartAfterPhase = phases[s.StartAfterPhase];

            var mOrder = 0;
            foreach (var ms in s.Milestones)
            {
                if (!milestones.TryGetValue(ms.Key, out var m))
                {
                    m = new ProjectMilestone { Key = ms.Key, TitleEn = ms.TitleEn, TitleAr = ms.TitleAr };
                    db.ProjectMilestones.Add(m);
                }
                m.Project = p;
                m.Order = ++mOrder;
                m.TitleEn = ms.TitleEn;
                m.TitleAr = ms.TitleAr;
                m.DescriptionEn = ms.DescriptionEn;
                m.DescriptionAr = ms.DescriptionAr;

                var tOrder = 0;
                foreach (var ts in ms.Tasks)
                {
                    if (!tasks.TryGetValue(ts.Key, out var t))
                    {
                        t = new ProjectTask { Key = ts.Key, TitleEn = ts.TitleEn, TitleAr = ts.TitleAr };
                        db.ProjectTasks.Add(t);
                    }
                    t.Milestone = m;
                    t.Order = ++tOrder;
                    t.TitleEn = ts.TitleEn;
                    t.TitleAr = ts.TitleAr;
                    t.DescriptionEn = ts.DescriptionEn;
                    t.DescriptionAr = ts.DescriptionAr;
                    t.AcceptanceCriteriaEn = string.Join('\n', ts.CriteriaEn);
                    t.AcceptanceCriteriaAr = string.Join('\n', ts.CriteriaAr);
                    t.EstimatedMinutes = ts.Minutes;
                    t.Priority = ts.Priority;
                    t.IsChangeRequest = ts.ChangeRequest;
                    t.UnlockAtPercent = ts.UnlockAt;

                    var wanted = ts.Topics.Select(slug => topics[slug].Id).ToHashSet();
                    t.TopicLinks.RemoveAll(l => !wanted.Contains(l.TopicId));
                    foreach (var id in wanted.Where(id => t.TopicLinks.All(l => l.TopicId != id)))
                        t.TopicLinks.Add(new ProjectTaskTopic { TopicId = id });
                }
            }
        }
        await db.SaveChangesAsync(ct);
    }

    private async Task SeedChecklistAsync(List<ChecklistSeed> seeds, CancellationToken ct)
    {
        var existing = await db.PortfolioChecklistItems.ToDictionaryAsync(i => i.Key, ct);
        var order = 0;
        foreach (var s in seeds)
        {
            if (!existing.TryGetValue(s.Key, out var i))
            {
                i = new PortfolioChecklistItem { Key = s.Key, TitleEn = s.TitleEn, TitleAr = s.TitleAr };
                db.PortfolioChecklistItems.Add(i);
            }
            i.Order = ++order;
            i.TitleEn = s.TitleEn;
            i.TitleAr = s.TitleAr;
            i.DescriptionEn = s.DescriptionEn;
            i.DescriptionAr = s.DescriptionAr;
        }
        await db.SaveChangesAsync(ct);
    }

    private async Task SeedExercisesAsync(List<ExerciseSeed> seeds, Dictionary<string, Topic> topics, CancellationToken ct)
    {
        var existing = await db.PracticeExercises.ToDictionaryAsync(e => e.Key, ct);
        foreach (var s in seeds)
        {
            if (!existing.TryGetValue(s.Key, out var e))
            {
                e = new PracticeExercise { Key = s.Key, TitleEn = s.TitleEn, TitleAr = s.TitleAr };
                db.PracticeExercises.Add(e);
            }
            e.Type = s.Type;
            e.TopicId = topics[s.Topic].Id;
            e.Difficulty = s.Difficulty;
            e.EstimatedMinutes = s.Minutes;
            e.TitleEn = s.TitleEn;
            e.TitleAr = s.TitleAr;
            e.ProblemEn = s.ProblemEn;
            e.ProblemAr = s.ProblemAr;
            (e.Code, e.CodeLanguage) = _snippets.Get("practice", s.Key);
            e.ExpectedOutcomeEn = s.ExpectedEn;
            e.ExpectedOutcomeAr = s.ExpectedAr;
            e.HintsEn = string.Join('\n', s.HintsEn);
            e.HintsAr = string.Join('\n', s.HintsAr);
            e.SolutionEn = s.SolutionEn;
            e.SolutionAr = s.SolutionAr;
            e.SolutionCode = _snippets.Get("practice", s.Key + ".solution").Code;
        }
        await db.SaveChangesAsync(ct);
    }

    private async Task SeedInterviewsAsync(List<InterviewSeed> seeds, Dictionary<string, Topic> topics, CancellationToken ct)
    {
        var existing = await db.InterviewQuestions.ToDictionaryAsync(q => q.Key, ct);
        foreach (var s in seeds)
        {
            if (!existing.TryGetValue(s.Key, out var q))
            {
                q = new InterviewQuestion { Key = s.Key, QuestionEn = s.QuestionEn, QuestionAr = s.QuestionAr };
                db.InterviewQuestions.Add(q);
            }
            q.Category = s.Category;
            q.TopicId = topics[s.Topic].Id;
            q.Difficulty = s.Difficulty;
            q.QuestionEn = s.QuestionEn;
            q.QuestionAr = s.QuestionAr;
            q.AnswerEn = s.AnswerEn;
            q.AnswerAr = s.AnswerAr;
            q.ExampleCode = _snippets.Get("interviews", s.Key).Code;
            q.FollowUpEn = s.FollowUpEn;
            q.FollowUpAr = s.FollowUpAr;
        }
        await db.SaveChangesAsync(ct);
    }
}

/// <summary>All seed files loaded into memory, plus integrity checks.</summary>
public class SeedContent
{
    public List<PhaseSeed> Phases { get; private init; } = [];
    public List<ResourceSeed> Resources { get; private init; } = [];
    public List<ProjectSeed> Projects { get; private init; } = [];
    public List<ChecklistSeed> Checklist { get; private init; } = [];
    public List<ExerciseSeed> Exercises { get; private init; } = [];
    public List<InterviewSeed> Interviews { get; private init; } = [];

    public static SeedContent Load(string dir, JsonSerializerOptions options)
    {
        if (!Directory.Exists(dir))
            throw new DirectoryNotFoundException($"Seed directory not found: {dir}");

        T Read<T>(string path) =>
            JsonSerializer.Deserialize<T>(File.ReadAllText(path), options)
            ?? throw new InvalidDataException($"Seed file is empty: {path}");

        List<T> ReadAll<T>(string subDir) =>
            Directory.GetFiles(Path.Combine(dir, subDir), "*.json").Order()
                .SelectMany(f => Read<List<T>>(f)).ToList();

        return new SeedContent
        {
            Phases = Directory.GetFiles(Path.Combine(dir, "roadmap"), "*.json").Order()
                .Select(Read<PhaseSeed>).OrderBy(p => p.Order).ToList(),
            Resources = Read<List<ResourceSeed>>(Path.Combine(dir, "resources.json")),
            Projects = Read<List<ProjectSeed>>(Path.Combine(dir, "projects.json")),
            Checklist = Read<List<ChecklistSeed>>(Path.Combine(dir, "portfolio-checklist.json")),
            Exercises = ReadAll<ExerciseSeed>("practice"),
            Interviews = ReadAll<InterviewSeed>("interviews"),
        };
    }

    /// <summary>Fails fast with a clear message if a seed file references something that doesn't exist.</summary>
    public void Validate()
    {
        var errors = new List<string>();

        void Unique(IEnumerable<string> keys, string what)
        {
            foreach (var dup in keys.GroupBy(k => k).Where(g => g.Count() > 1))
                errors.Add($"Duplicate {what}: '{dup.Key}'");
        }

        var topicSlugs = Phases.SelectMany(p => p.Topics).Select(t => t.Slug).ToList();
        var topicSet = topicSlugs.ToHashSet();
        var phaseSet = Phases.Select(p => p.Slug).ToHashSet();

        Unique(Phases.Select(p => p.Slug), "phase slug");
        Unique(topicSlugs, "topic slug");
        Unique(Resources.Select(r => r.Key), "resource key");
        Unique(Resources.Select(r => r.Url), "resource url");
        Unique(Projects.Select(p => p.Slug), "project slug");
        Unique(Projects.SelectMany(p => p.Milestones).Select(m => m.Key), "milestone key");
        Unique(Projects.SelectMany(p => p.Milestones).SelectMany(m => m.Tasks).Select(t => t.Key), "task key");
        Unique(Checklist.Select(c => c.Key), "checklist key");
        Unique(Exercises.Select(e => e.Key), "exercise key");
        Unique(Interviews.Select(q => q.Key), "interview key");

        void Ref(string slug, string from)
        {
            if (!topicSet.Contains(slug)) errors.Add($"{from} references unknown topic '{slug}'");
        }

        foreach (var t in Phases.SelectMany(p => p.Topics))
            foreach (var pre in t.Prerequisites ?? [])
            {
                Ref(pre, $"Topic '{t.Slug}'");
                if (pre == t.Slug) errors.Add($"Topic '{t.Slug}' lists itself as a prerequisite");
            }
        foreach (var r in Resources) foreach (var s in r.Topics) Ref(s, $"Resource '{r.Key}'");
        foreach (var p in Projects)
        {
            if (!phaseSet.Contains(p.StartAfterPhase)) errors.Add($"Project '{p.Slug}' references unknown phase '{p.StartAfterPhase}'");
            foreach (var t in p.Milestones.SelectMany(m => m.Tasks))
                foreach (var s in t.Topics) Ref(s, $"Task '{t.Key}'");
        }
        foreach (var e in Exercises) Ref(e.Topic, $"Exercise '{e.Key}'");
        foreach (var q in Interviews) Ref(q.Topic, $"Interview question '{q.Key}'");

        // A prerequisite cycle would make those topics impossible to recommend.
        var graph = Phases.SelectMany(p => p.Topics).ToDictionary(t => t.Slug, t => t.Prerequisites ?? []);
        var state = new Dictionary<string, int>(); // 1 = visiting, 2 = done
        bool HasCycle(string slug)
        {
            if (state.GetValueOrDefault(slug) == 1) return true;
            if (state.GetValueOrDefault(slug) == 2) return false;
            state[slug] = 1;
            if (graph.GetValueOrDefault(slug, []).Any(HasCycle)) return true;
            state[slug] = 2;
            return false;
        }
        foreach (var slug in graph.Keys.Where(HasCycle).Take(1))
            errors.Add($"Prerequisite cycle detected involving topic '{slug}'");

        if (errors.Count > 0)
            throw new InvalidDataException("Seed data is invalid:\n  " + string.Join("\n  ", errors));
    }
}
