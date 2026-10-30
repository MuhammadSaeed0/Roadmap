using DevPath.Api.Models;

namespace DevPath.Api.Data.Seeding;

// Shapes of the JSON seed files in /SeedData. Kept separate from the entities so the
// JSON can use friendly forms (arrays of lines, slugs instead of database ids).
// Code samples are NOT in the JSON: they live in SeedData/snippets as real .cs/.ts/.sql
// files so they're easy to read and edit. See SnippetStore.

public record PhaseSeed(
    string Slug, int Order, string TitleEn, string TitleAr,
    string DescriptionEn, string DescriptionAr, List<TopicSeed> Topics);

public record TopicSeed(
    string Slug, SkillArea Skill, TopicPriority Priority, int Minutes,
    string TitleEn, string TitleAr,
    string SummaryEn, string SummaryAr,
    string WhyEn, string WhyAr,
    string HowEn, string HowAr,
    string ExampleEn, string ExampleAr,
    string PracticeEn, string PracticeAr,
    string ChallengeEn, string ChallengeAr,
    List<string>? Prerequisites);

public record ResourceSeed(
    string Key, string TitleEn, string? TitleAr, string Url, string Source,
    ResourceType Type, Difficulty Difficulty, bool Free, List<string> Topics,
    DateOnly? CheckedOn, int? CheckedStatus);

public record ProjectSeed(
    string Slug, int Order, string TitleEn, string TitleAr,
    string SummaryEn, string SummaryAr,
    List<string> RequirementsEn, List<string> RequirementsAr,
    string TechStack, string StartAfterPhase, List<MilestoneSeed> Milestones);

public record MilestoneSeed(
    string Key, string TitleEn, string TitleAr, string DescriptionEn, string DescriptionAr,
    List<TaskSeed> Tasks);

public record TaskSeed(
    string Key, string TitleEn, string TitleAr, string DescriptionEn, string DescriptionAr,
    List<string> CriteriaEn, List<string> CriteriaAr, int Minutes, TaskPriority Priority,
    List<string> Topics, bool ChangeRequest = false, int UnlockAt = 0);

/// <summary>One curated video in SeedData/videos.json ({ "topic-slug": [ ...videos ] }).</summary>
/// <summary>
/// A curated YouTube video. Language is "en" (default) or "ar"; Duration is "m:ss" or "h:mm:ss" as YouTube shows it.
/// </summary>
public record VideoSeed(string VideoId, string Title, string Channel, string? Language = null, string? Duration = null, string? Description = null)
{
    public VideoLanguage ParsedLanguage => Language?.ToLowerInvariant() switch
    {
        null or "" or "en" => VideoLanguage.English,
        "ar" => VideoLanguage.Arabic,
        _ => throw new InvalidDataException($"Unknown video language '{Language}' for {VideoId}; use \"en\" or \"ar\"."),
    };

    public int? DurationSeconds
    {
        get
        {
            if (string.IsNullOrWhiteSpace(Duration)) return null;
            var parts = Duration.Split(':').Select(int.Parse).ToArray();
            return parts.Aggregate(0, (total, part) => total * 60 + part);
        }
    }
}

/// <summary>One quiz question in SeedData/quizzes/*.json. Answer is the index of the correct option.</summary>
public record QuizSeed(
    string Key, string Topic, string QuestionEn, string QuestionAr,
    List<string> OptionsEn, List<string> OptionsAr, int Answer,
    string ExplanationEn, string ExplanationAr);

public record ChecklistSeed(string Key, string TitleEn, string TitleAr, string DescriptionEn, string DescriptionAr);

/// <summary>
/// One Practice Lab exercise in SeedData/practice/*.json. Code lives next to it in files:
/// a single snippet in snippets/practice/{key}.{ext} (+ {key}.solution.{ext}), or a multi-file
/// workspace in practice-files/{key}/starter/** and practice-files/{key}/solution/**, with the
/// automatic checks in practice-files/{key}/tests.cs | tests.js | tests.json.
/// </summary>
public record ExerciseSeed(
    string Key, ExerciseType Type, string Topic, Difficulty Difficulty, int Minutes,
    string TitleEn, string TitleAr, string ProblemEn, string ProblemAr,
    string ExpectedEn, string ExpectedAr,
    List<string> HintsEn, List<string> HintsAr,
    string SolutionEn, string SolutionAr,
    ExerciseRunner Runner = ExerciseRunner.None, string? Dataset = null, List<SkillArea>? Technologies = null,
    string? ScenarioEn = null, string? ScenarioAr = null,
    List<string>? RequirementsEn = null, List<string>? RequirementsAr = null,
    List<string>? AcceptanceEn = null, List<string>? AcceptanceAr = null,
    List<string>? BonusEn = null, List<string>? BonusAr = null);

public record InterviewSeed(
    string Key, InterviewCategory Category, string Topic, Difficulty Difficulty,
    string QuestionEn, string QuestionAr, string AnswerEn, string AnswerAr,
    string? FollowUpEn, string? FollowUpAr);

/// <summary>
/// Loads code snippets from SeedData/snippets/{area}/{key}.{ext}.
/// The file extension decides the language label (cs → csharp, ts → typescript ...).
/// Exercise solutions use the suffix ".solution", e.g. practice/linq-filter.solution.cs.
/// </summary>
public class SnippetStore
{
    private static readonly Dictionary<string, string> Languages = new(StringComparer.OrdinalIgnoreCase)
    {
        [".cs"] = "csharp", [".ts"] = "typescript", [".sql"] = "sql", [".html"] = "html",
        [".css"] = "css", [".json"] = "json", [".sh"] = "bash", [".http"] = "http", [".txt"] = "text"
    };

    private readonly Dictionary<string, (string Code, string Language)> _snippets = new(StringComparer.OrdinalIgnoreCase);

    public SnippetStore(string snippetsDirectory)
    {
        if (!Directory.Exists(snippetsDirectory)) return;
        foreach (var file in Directory.EnumerateFiles(snippetsDirectory, "*.*", SearchOption.AllDirectories))
        {
            var ext = Path.GetExtension(file);
            if (!Languages.TryGetValue(ext, out var language)) continue;
            var area = Path.GetFileName(Path.GetDirectoryName(file))!;
            var key = Path.GetFileNameWithoutExtension(file);
            var code = File.ReadAllText(file).Replace("\r\n", "\n").TrimEnd();
            _snippets[$"{area}/{key}"] = (code, language);
        }
    }

    public IReadOnlyCollection<string> Keys => _snippets.Keys;

    public (string? Code, string? Language) Get(string area, string key) =>
        _snippets.TryGetValue($"{area}/{key}", out var s) ? (s.Code, s.Language) : (null, null);
}

/// <summary>
/// Multi-file exercise workspaces in SeedData/practice-files/{key}/: starter/** and solution/** become
/// JSON file lists, tests.cs | tests.js | tests.json the exercise's automatic checks.
/// </summary>
public class PracticeFileStore(string directory)
{
    private static readonly System.Text.Json.JsonSerializerOptions Json = new(System.Text.Json.JsonSerializerDefaults.Web);
    private static readonly string[] TestFiles = ["tests.cs", "tests.js", "tests.json"];

    public bool Has(string key) => Directory.Exists(Path.Combine(directory, key));

    public string? Files(string key, string part)
    {
        var root = Path.Combine(directory, key, part);
        if (!Directory.Exists(root)) return null;
        var files = Directory.EnumerateFiles(root, "*", SearchOption.AllDirectories)
            .Select(f => new DevPath.Api.DTOs.WorkspaceFileDto(
                Path.GetRelativePath(root, f).Replace(Path.DirectorySeparatorChar, '/'),
                File.ReadAllText(f).Replace("\r\n", "\n")))
            .OrderBy(f => f.Path, StringComparer.Ordinal)
            .ToList();
        return files.Count == 0 ? null : System.Text.Json.JsonSerializer.Serialize(files, Json);
    }

    public string? Tests(string key) =>
        TestFiles.Select(name => Path.Combine(directory, key, name)).Where(File.Exists)
            .Select(f => File.ReadAllText(f).Replace("\r\n", "\n")).FirstOrDefault();
}
