using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services.Cv;

/// <summary>
/// Suggests CV content from what the user actually did on the platform, and says how strong the evidence is:
/// <list type="bullet">
/// <item><b>verified</b>: exercises that passed every automatic check (score 100).</item>
/// <item><b>built</b>: a platform project with a repository link and completed tasks.</item>
/// <item><b>practiced</b>: exercises or project tasks the user marked as done.</item>
/// <item><b>studied</b>: topics the user marked as completed.</item>
/// </list>
/// Unfinished work is never presented as finished, roadmap progress is never offered as a certification, and
/// nothing is added to a CV until the user chooses to add it.
/// </summary>
public class CvSuggestionService(AppDbContext db)
{
    private static readonly Dictionary<SkillArea, (string Name, string Category, string CategoryAr)> SkillNames = new()
    {
        [SkillArea.CSharp] = ("C#", "Languages", "اللغات"),
        [SkillArea.TypeScript] = ("TypeScript", "Languages", "اللغات"),
        [SkillArea.AspNetCore] = ("ASP.NET Core", "Backend", "الواجهة الخلفية"),
        [SkillArea.EfCore] = ("Entity Framework Core", "Backend", "الواجهة الخلفية"),
        [SkillArea.SqlServer] = ("SQL Server", "Databases", "قواعد البيانات"),
        [SkillArea.Angular] = ("Angular", "Frontend", "الواجهة الأمامية"),
        [SkillArea.Testing] = ("Automated testing", "Practices", "الممارسات"),
        [SkillArea.Git] = ("Git", "Tools", "الأدوات"),
    };

    private static readonly string[] Levels = ["verified", "built", "practiced", "studied"];

    public async Task<CvSuggestionsDto> GetAsync(bool arabic, CancellationToken ct)
    {
        var topics = await db.Topics.AsNoTracking()
            .Select(t => new { t.Id, t.Skill, t.Priority, t.PhaseId, Status = t.ProgressRows.Select(p => (TopicStatus?)p.Status).FirstOrDefault() })
            .ToListAsync(ct);
        var exercises = await db.PracticeProgress.AsNoTracking()
            .Where(p => p.Status == PracticeStatus.Completed || p.BestScore == 100)
            .Select(p => new
            {
                p.Exercise.Key, p.Exercise.TitleEn, p.Exercise.TitleAr, p.Exercise.Type, p.Exercise.Runner, p.Exercise.Technologies,
                p.Exercise.ScenarioEn, p.Exercise.ScenarioAr, p.Exercise.ProblemEn, p.Exercise.ProblemAr, p.Exercise.Topic.Skill,
                p.BestScore, p.CompletedAt, p.LastSubmittedAt,
            })
            .ToListAsync(ct);
        var tasks = await db.ProjectTasks.AsNoTracking()
            .Select(t => new
            {
                t.Milestone.ProjectId, t.MilestoneId, MilestoneEn = t.Milestone.TitleEn, MilestoneAr = t.Milestone.TitleAr,
                Skills = t.TopicLinks.Select(l => l.Topic.Skill).ToList(),
                Progress = t.ProgressRows.Select(p => new { p.Status, p.CompletedAt }).FirstOrDefault(),
            })
            .ToListAsync(ct);
        var projects = await db.Projects.AsNoTracking().OrderBy(p => p.Order)
            .Select(p => new { p.Id, p.Slug, p.TitleEn, p.TitleAr, p.SummaryEn, p.SummaryAr, p.TechStack, Repo = p.Repositories.Select(r => r.RepositoryUrl).FirstOrDefault() })
            .ToListAsync(ct);
        var phases = await db.Phases.AsNoTracking().OrderBy(p => p.Order).Select(p => new { p.Id, p.TitleEn, p.TitleAr }).ToListAsync(ct);

        // An exercise counts as verified only when automatic checks exist and all of them passed.
        bool Verified(ExerciseRunner runner, int? score) => runner != ExerciseRunner.None && score == 100;

        // ---- skills
        var skills = new List<CvSkillSuggestion>();
        foreach (var (area, (name, category, categoryAr)) in SkillNames)
        {
            bool Uses(SkillArea skill, string? technologies) =>
                skill == area || (technologies ?? "").Split(',').Contains(area.ToString());
            var verified = exercises.Count(e => Uses(e.Skill, e.Technologies) && Verified(e.Runner, e.BestScore));
            var practicedExercises = exercises.Count(e => Uses(e.Skill, e.Technologies) && !Verified(e.Runner, e.BestScore));
            // Built: a project with a repository where the user finished tasks that use this skill (or finished
            // the whole project, when its stack names the skill).
            var builtIn = projects.Where(p => p.Repo is not null && (
                    tasks.Any(t => t.ProjectId == p.Id && t.Progress?.Status == ProjectTaskStatus.Completed && t.Skills.Contains(area))
                    || (TechStackUses(p.TechStack, area) && tasks.Where(t => t.ProjectId == p.Id).All(t => t.Progress?.Status == ProjectTaskStatus.Completed))))
                .Select(p => arabic ? p.TitleAr : p.TitleEn).ToList();
            var practicedTasks = tasks.Count(t => t.Progress?.Status == ProjectTaskStatus.Completed && t.Skills.Contains(area));
            var areaTopics = topics.Where(t => t.Skill == area).ToList();
            var studied = areaTopics.Count(t => t.Status == TopicStatus.Completed);

            CvEvidence? evidence =
                verified > 0 ? new("verified", $"Passed every automatic check in {Plural(verified, "exercise")}", $"اجتاز كل الاختبارات التلقائية في {verified} من التمارين")
                : builtIn.Count > 0 ? new("built", $"Used in {string.Join(", ", builtIn)} (with a repository)", $"مستخدم في {string.Join("، ", builtIn)} (مع مستودع)")
                : practicedExercises + practicedTasks > 0 ? new("practiced",
                    "Marked as done: " + string.Join(", ", new[] { (practicedExercises, "exercise"), (practicedTasks, "project task") }
                        .Where(x => x.Item1 > 0).Select(x => Plural(x.Item1, x.Item2))),
                    "تم تعليمها كمنجزة: " + string.Join("، ", new[] { (practicedExercises, "من التمارين"), (practicedTasks, "من مهام المشاريع") }
                        .Where(x => x.Item1 > 0).Select(x => $"{x.Item1} {x.Item2}")))
                : studied > 0 ? new("studied", $"Completed {studied} of {areaTopics.Count} topics", $"أكمل {studied} من {areaTopics.Count} موضوعًا")
                : null;
            if (evidence is not null) skills.Add(new CvSkillSuggestion(name, arabic ? categoryAr : category, evidence));
        }
        // SQL as a language, when SQL Server work is evidenced.
        if (skills.FirstOrDefault(s => s.Name == "SQL Server") is { } sql)
            skills.Add(new CvSkillSuggestion("SQL", arabic ? "اللغات" : "Languages", sql.Evidence));
        skills = skills.OrderBy(s => Array.IndexOf(Levels, s.Evidence.Level)).ToList();

        // ---- projects: the platform's guided projects with at least one completed task
        var projectSuggestions = new List<CvProjectSuggestion>();
        foreach (var p in projects)
        {
            var own = tasks.Where(t => t.ProjectId == p.Id).ToList();
            var done = own.Where(t => t.Progress?.Status == ProjectTaskStatus.Completed).ToList();
            if (done.Count == 0) continue;
            var finishedMilestones = own.GroupBy(t => t.MilestoneId)
                .Where(g => g.All(t => t.Progress?.Status == ProjectTaskStatus.Completed))
                .Select(g => arabic ? g.First().MilestoneAr : g.First().MilestoneEn).ToList();
            var complete = done.Count == own.Count;
            var last = done.Max(t => t.Progress!.CompletedAt);
            var detailEn = $"{done.Count} of {own.Count} tasks done";
            var detailAr = $"أنجز {done.Count} من {own.Count} مهمة";
            var evidence = p.Repo is not null
                ? new CvEvidence("built", detailEn + ", repository linked", detailAr + "، مع رابط المستودع")
                : new CvEvidence("practiced", detailEn + " (no repository linked yet)", detailAr + " (لم يُربط مستودع بعد)");
            projectSuggestions.Add(new CvProjectSuggestion(
                "project:" + p.Slug, arabic ? p.TitleAr : p.TitleEn, complete ? "completed" : "in-progress", done.Count, own.Count,
                p.TechStack.Split('·', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries),
                arabic ? p.SummaryAr : p.SummaryEn, finishedMilestones, p.Repo ?? "", last?.Year.ToString() ?? "", evidence));
        }
        // ... and completed mini-project / full-stack exercises
        foreach (var e in exercises.Where(e => e.Type is ExerciseType.MiniProject or ExerciseType.FullStack))
        {
            var technologies = (e.Technologies ?? e.Skill.ToString()).Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => Enum.TryParse<SkillArea>(s, out var a) && SkillNames.TryGetValue(a, out var n) ? n.Name : s).Distinct().ToList();
            var description = FirstSentences(arabic ? (e.ScenarioAr.Length > 0 ? e.ScenarioAr : e.ProblemAr) : (e.ScenarioEn.Length > 0 ? e.ScenarioEn : e.ProblemEn));
            var evidence = Verified(e.Runner, e.BestScore)
                ? new CvEvidence("verified", "Passed every automatic check", "اجتاز كل الاختبارات التلقائية")
                : new CvEvidence("practiced", "Marked as done", "تم تعليمه كمنجز");
            projectSuggestions.Add(new CvProjectSuggestion(
                "exercise:" + e.Key, arabic ? e.TitleAr : e.TitleEn, "completed", 1, 1, technologies, description, [], "",
                (e.LastSubmittedAt ?? e.CompletedAt)?.Year.ToString() ?? "", evidence));
        }
        projectSuggestions = projectSuggestions.OrderBy(p => Array.IndexOf(Levels, p.Evidence.Level)).ToList();

        // ---- coursework: only phases whose core topics are all completed
        var coursework = new List<CvCourseworkSuggestion>();
        foreach (var phase in phases)
        {
            var core = topics.Where(t => t.PhaseId == phase.Id && t.Priority == TopicPriority.Core).ToList();
            if (core.Count == 0 || core.Any(t => t.Status != TopicStatus.Completed)) continue;
            var completed = topics.Count(t => t.PhaseId == phase.Id && t.Status == TopicStatus.Completed);
            coursework.Add(new CvCourseworkSuggestion(arabic ? phase.TitleAr : phase.TitleEn,
                arabic ? $"أكمل {completed} موضوعًا منها كل المواضيع الأساسية" : $"{completed} topics completed, including every core topic",
                new CvEvidence("studied", "Self-paced study on DevPath, marked complete by you", "دراسة ذاتية على DevPath، أنت من علّمتها كمكتملة")));
        }

        return new CvSuggestionsDto(skills, projectSuggestions, coursework,
            "Progress on DevPath is not a certification. List only certificates you earned from the organisation that issued them.",
            "التقدم في DevPath ليس شهادة. أضف فقط الشهادات التي حصلت عليها فعلًا من الجهة التي أصدرتها.");
    }

    private static bool TechStackUses(string techStack, SkillArea area) => area switch
    {
        SkillArea.CSharp => techStack.Contains("C#") || techStack.Contains(".NET") || techStack.Contains("ASP.NET"),
        SkillArea.AspNetCore => techStack.Contains("ASP.NET Core"),
        SkillArea.EfCore => techStack.Contains("EF Core") || techStack.Contains("Entity Framework"),
        SkillArea.SqlServer => techStack.Contains("SQL Server"),
        SkillArea.TypeScript => techStack.Contains("TypeScript") || techStack.Contains("Angular"),
        SkillArea.Angular => techStack.Contains("Angular"),
        SkillArea.Testing => techStack.Contains("xUnit") || techStack.Contains("Vitest") || techStack.Contains("test", StringComparison.OrdinalIgnoreCase),
        _ => false,
    };

    private static string Plural(int n, string noun) => n == 1 ? $"1 {noun}" : $"{n} {noun}s";

    /// <summary>The first sentence or two, at most about 300 characters, without Markdown markers.</summary>
    private static string FirstSentences(string text)
    {
        var plain = text.Replace("**", "").Replace("`", "").Replace("\r", "").Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(l => l.TrimStart('#', '-', '*', ' ')).FirstOrDefault(l => l.Length > 0) ?? "";
        if (plain.Length <= 300) return plain;
        var cut = plain.LastIndexOfAny(['.', '!', '?', '؟'], 300);
        return cut > 80 ? plain[..(cut + 1)] : plain[..300].TrimEnd() + "…";
    }
}
