using System.Text.Json;
using System.Text.RegularExpressions;
using DevPath.Api.Data.Seeding;

namespace DevPath.Api.Tests;

/// <summary>The written tutorials in SeedData/tutorials: depth of the deepened lessons and the formatting lessons may use.</summary>
public partial class TutorialContentTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly string Seed = Path.Combine(AppContext.BaseDirectory, "SeedData", "tutorials");

    /// <summary>The 20 topics that were shortest in Arabic (2026-11-23), expanded first. Add topics here as more are deepened.</summary>
    private static readonly string[] Deepened =
    [
        "oop-interfaces", "cs-records", "oop-inheritance", "arch-design-patterns", "cs-pattern-matching",
        "linq-advanced", "oop-object-modeling", "ng-inputs-outputs", "oop-encapsulation", "cs-lambdas",
        "oop-solid", "oop-composition", "cs-cancellation-tokens", "oop-polymorphism", "cs-delegates",
        "api-validation", "linq-fundamentals", "api-dependency-injection", "ng-routing", "linq-deferred-execution",
    ];

    private const int MinArabicWords = 250;

    private static List<TutorialSeed> Tutorials() =>
        Directory.GetFiles(Seed, "*.json").SelectMany(f => JsonSerializer.Deserialize<List<TutorialSeed>>(File.ReadAllText(f), Json)!).ToList();

    private static int Words(string text) => WordPattern().Matches(text).Count;

    [GeneratedRegex(@"\S+")]
    private static partial Regex WordPattern();

    [Fact]
    public void Deepened_topics_have_at_least_250_Arabic_words_and_end_with_common_mistakes()
    {
        var byTopic = Tutorials().ToDictionary(t => t.Topic);
        foreach (var slug in Deepened)
        {
            Assert.True(byTopic.TryGetValue(slug, out var tutorial), $"no tutorial for {slug}");
            var arabic = tutorial!.Lessons.Sum(l => Words(l.BodyAr));
            Assert.True(arabic >= MinArabicWords, $"{slug} has {arabic} Arabic words; at least {MinArabicWords} expected");
            var last = tutorial.Lessons[^1];
            Assert.Equal("Common mistakes", last.TitleEn);
            Assert.Equal("أخطاء شائعة", last.TitleAr);
        }
    }

    [Fact]
    public void Lesson_bodies_use_only_paragraphs_dash_lists_and_inline_code()
    {
        var problems = new List<string>();
        foreach (var lesson in Tutorials().SelectMany(t => t.Lessons))
            foreach (var body in new[] { lesson.BodyEn, lesson.BodyAr })
            {
                // Inline code may contain anything, so look only at the text outside backticks.
                if (body.Count(c => c == '`') % 2 != 0) { problems.Add($"{lesson.Key}: unbalanced backticks"); continue; }
                var prose = string.Concat(body.Split('`').Where((_, i) => i % 2 == 0));
                foreach (var line in prose.Split('\n'))
                    if (line.Contains("**") || Regex.IsMatch(line, @"^\s*(\d+[.)]|[*•]|#)\s"))
                        problems.Add($"{lesson.Key}: {line.Trim()}");
            }
        Assert.Empty(problems);
    }
}
