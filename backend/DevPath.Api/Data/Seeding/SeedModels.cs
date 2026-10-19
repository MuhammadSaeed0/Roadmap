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

public record ChecklistSeed(string Key, string TitleEn, string TitleAr, string DescriptionEn, string DescriptionAr);

public record ExerciseSeed(
    string Key, ExerciseType Type, string Topic, Difficulty Difficulty, int Minutes,
    string TitleEn, string TitleAr, string ProblemEn, string ProblemAr,
    string ExpectedEn, string ExpectedAr,
    List<string> HintsEn, List<string> HintsAr,
    string SolutionEn, string SolutionAr);

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
