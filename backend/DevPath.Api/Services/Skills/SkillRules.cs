using System.Text.Json;
using System.Text.Json.Serialization;
using DevPath.Api.Data.Seeding;
using DevPath.Api.Models;

namespace DevPath.Api.Services.Skills;

/// <summary>
/// The scoring model: point values, verification factors, evidence weights, competency categories and level
/// requirements. Read from SeedData/skill-assessment.json, so the numbers can be tuned without code changes.
/// </summary>
public sealed class SkillRules
{
    public required PointRules Points { get; init; }
    public required Dictionary<VerificationTier, double> Verification { get; init; }
    public required Dictionary<EvidenceKind, double> EvidenceWeights { get; init; }
    public required List<CategoryRule> Categories { get; init; }
    public required TopicCategoryRules TopicCategories { get; init; }
    public Dictionary<string, Difficulty> PhaseDifficulty { get; init; } = [];
    public Dictionary<ExerciseType, string> ExerciseExtraCategories { get; init; } = [];
    public Dictionary<InterviewCategory, string> InterviewCategories { get; init; } = [];
    public Dictionary<string, ProjectSize> ProjectSizes { get; init; } = [];
    public List<ReviewCriterionRule> ReviewCriteria { get; init; } = [];
    public double WeakThreshold { get; init; } = 40;
    public int StaleKnowledgeDays { get; init; } = 90;
    public required List<LevelRule> Levels { get; init; }

    public static string DefaultPath => Path.Combine(DbSeeder.DefaultSeedDirectory, "skill-assessment.json");

    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        Converters = { new JsonStringEnumConverter() },
    };

    public static SkillRules Load(string? path = null)
    {
        path ??= DefaultPath;
        var rules = JsonSerializer.Deserialize<SkillRules>(File.ReadAllText(path), Json)
            ?? throw new InvalidOperationException($"{path} is empty.");
        rules.Validate();
        return rules;
    }

    /// <summary>Fails start-up on a rules file that would give meaningless scores.</summary>
    public void Validate()
    {
        var keys = Categories.Select(c => c.Key).ToHashSet();
        if (keys.Count != Categories.Count) throw new InvalidOperationException("skill-assessment.json: duplicate category key.");
        IEnumerable<string> referenced = TopicCategories.Slugs.Values
            .Concat(TopicCategories.Prefixes.Values).Concat(TopicCategories.Phases.Values)
            .Concat(ExerciseExtraCategories.Values).Concat(InterviewCategories.Values)
            .Concat(ReviewCriteria.Select(r => r.Category))
            .Concat(Levels.SelectMany(l => l.Categories.Keys));
        var unknown = referenced.Where(k => !keys.Contains(k)).Distinct().ToList();
        if (unknown.Count > 0) throw new InvalidOperationException($"skill-assessment.json: unknown categories {string.Join(", ", unknown)}.");
        if (Levels.Count == 0 || Levels[0].MinXp != 0) throw new InvalidOperationException("skill-assessment.json: the first level must start at 0 XP.");
        for (var i = 1; i < Levels.Count; i++)
            if (Levels[i].MinXp <= Levels[i - 1].MinXp) throw new InvalidOperationException("skill-assessment.json: level XP thresholds must increase.");
        foreach (var tier in Enum.GetValues<VerificationTier>())
            if (!Verification.ContainsKey(tier)) throw new InvalidOperationException($"skill-assessment.json: no factor for {tier}.");
        if (EvidenceWeights.Values.Sum() <= 0) throw new InvalidOperationException("skill-assessment.json: evidence weights must add up to more than 0.");
    }

    public double Factor(VerificationTier tier) => Verification.GetValueOrDefault(tier, 1);

    /// <summary>The topic's competency category: an explicit slug, then a slug prefix, then its phase.</summary>
    public string CategoryOfTopic(string slug, string phaseSlug)
    {
        if (TopicCategories.Slugs.TryGetValue(slug, out var c)) return c;
        foreach (var (prefix, category) in TopicCategories.Prefixes)
            if (slug.StartsWith(prefix, StringComparison.Ordinal)) return category;
        return TopicCategories.Phases.GetValueOrDefault(phaseSlug, "fundamentals");
    }

    /// <summary>The first category that represents a technology, for exercises that list the skills they combine.</summary>
    public string? CategoryOfSkill(SkillArea skill) => Categories.FirstOrDefault(c => c.Skill == skill && c.Key != "fundamentals")?.Key
        ?? Categories.FirstOrDefault(c => c.Skill == skill)?.Key;
}

public sealed class PointRules
{
    public required VideoPoints Video { get; init; }
    public required Dictionary<QuestionDifficulty, int> Question { get; init; }
    public Dictionary<int, int> QuizLevelPass { get; init; } = [];
    public RetryPenalty QuizRetryPenalty { get; init; } = new();
    public required Dictionary<TaskDifficulty, int> Topic { get; init; }
    public required Dictionary<ExerciseSize, int> Exercise { get; init; }
    public double ExerciseQualityShare { get; init; } = 0.2;
    public double ExerciseHintPenalty { get; init; } = 0.1;
    public double ExerciseMaxHintPenalty { get; init; } = 0.3;
    public double ExerciseSolutionFactor { get; init; } = 0.5;
    public required Dictionary<Difficulty, int> Interview { get; init; }
    public double InterviewPartialFactor { get; init; } = 0.5;
    public required Dictionary<ProjectTaskSize, int> ProjectTask { get; init; }
    public ProjectTaskBands ProjectTaskBands { get; init; } = new();
    public required Dictionary<ProjectSize, int> ProjectCompletion { get; init; }
    public required Dictionary<ProjectSize, int> ProjectReview { get; init; }
    public int PortfolioItem { get; init; } = 5;
    /// <summary>Points for each of your answers that another learner accepted.</summary>
    public int DiscussionAccepted { get; init; } = 15;
    /// <summary>Most accepted answers that earn points, so two accounts can't farm XP from each other.</summary>
    public int DiscussionAcceptedCap { get; init; } = 20;
    /// <summary>Points for each project review you completed for another learner.</summary>
    public int PeerReviewGiven { get; init; } = 30;
    /// <summary>Most reviews given that earn points.</summary>
    public int PeerReviewGivenCap { get; init; } = 20;
    /// <summary>Most self-reported points that count per day (0 = no limit).</summary>
    public int SelfReportedDailyCap { get; init; }
}

public sealed class VideoPoints
{
    public int Watched { get; init; } = 2;
    public int WatchedWithNotes { get; init; } = 5;
    public int WatchedAndAssessed { get; init; } = 10;
    public int MaxVideosPerTopic { get; init; } = 3;
    public int MinNoteCharacters { get; init; } = 80;
}

public sealed class RetryPenalty
{
    /// <summary>Wrong answers to a question allowed before its points are reduced.</summary>
    public int FreeAttempts { get; init; } = 3;
    public double Factor { get; init; } = 0.8;
}

public sealed class ProjectTaskBands
{
    public int SmallMaxMinutes { get; init; } = 40;
    public int MediumMaxMinutes { get; init; } = 60;
}

public sealed class CategoryRule
{
    public required string Key { get; init; }
    public double Weight { get; init; } = 1;
    /// <summary>The roadmap skill this category mostly covers (for exercises that list skills); null for cross-cutting categories.</summary>
    public SkillArea? Skill { get; init; }
}

public sealed class TopicCategoryRules
{
    public Dictionary<string, string> Slugs { get; init; } = [];
    public Dictionary<string, string> Prefixes { get; init; } = [];
    public Dictionary<string, string> Phases { get; init; } = [];
}

public sealed class ReviewCriterionRule
{
    public required string Key { get; init; }
    public required string Category { get; init; }
}

public sealed class LevelRule
{
    public required string Key { get; init; }
    public int MinXp { get; init; }
    public double MinOverall { get; init; }
    /// <summary>Category key → minimum score (0–100). These stop strength in one area from hiding a gap in another.</summary>
    public Dictionary<string, double> Categories { get; init; } = [];
    public int MinProjectTasks { get; init; }
    public int MinProjectsCompleted { get; init; }
    public int MinAdvancedProjects { get; init; }
}

public enum QuestionDifficulty { Easy, Medium, Hard, Advanced }
public enum TaskDifficulty { VeryEasy, Easy, Medium, Hard, Advanced }
public enum ExerciseSize { Basic, Intermediate, Advanced, Complex }
public enum ProjectTaskSize { Small, Medium, Complex }
public enum ProjectSize { Small, Medium, Advanced }
