using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Career readiness from observable evidence, reported as separate areas.
/// Deliberately NOT one combined score: a single number would hide gaps
/// (e.g. strong SQL but no Angular) and could be mistaken for a guarantee.
/// </summary>
public class CareerReadinessService(AppDbContext db, LearningStateLoader stateLoader, ProjectService projects)
{
    /// <summary>The skills a junior full-stack .NET + Angular developer uses every day.</summary>
    public static readonly SkillArea[] KeySkills =
        [SkillArea.CSharp, SkillArea.AspNetCore, SkillArea.EfCore, SkillArea.TypeScript, SkillArea.Angular, SkillArea.FullStack];

    // Project 4 is the main portfolio project, so it counts the most.
    private static readonly Dictionary<int, double> ProjectWeights = new() { [1] = 0.15, [2] = 0.25, [3] = 0.20, [4] = 0.40 };

    public async Task<CareerReadinessDto> GetAsync(CancellationToken ct)
    {
        var state = await stateLoader.LoadAsync(ct);
        var summaries = await projects.GetSummariesAsync(ct);
        var areas = new List<ReadinessAreaDto>();

        // 1. Core topics (SQL Server excluded: existing expertise shouldn't mask gaps).
        var core = state.Topics.Where(t => t.Priority == TopicPriority.Core && t.Skill != SkillArea.SqlServer).ToList();
        var coreDone = core.Count(t => t.IsDone);
        var firstCoreGap = core.FirstOrDefault(t => !t.IsDone);
        areas.Add(Area("coreTopics", Pct(coreDone, core.Count),
            [new("coreTopicsDone", coreDone, core.Count)],
            firstCoreGap is null ? new ReasonDto("keepReviewing") : TopicReason("studyTopic", firstCoreGap)));

        // 2. Confidence in key skills (unrated counts as 0).
        var key = state.Topics.Where(t => KeySkills.Contains(t.Skill) && t.Priority == TopicPriority.Core).ToList();
        var avg = key.Count == 0 ? 0 : key.Average(t => t.Confidence ?? 0);
        var independent = key.Count(t => t.Confidence >= 4);
        var weakest = key.Where(t => t.IsDone).OrderBy(t => t.Confidence ?? 0).FirstOrDefault();
        areas.Add(Area("confidence", Math.Round(avg / 5 * 100, 1),
            [new("averageConfidence", Math.Round(avg, 1), 4), new("independentTopics", independent, key.Count)],
            weakest is not null && (weakest.Confidence ?? 0) < 4 ? TopicReason("reviewTopic", weakest) : new ReasonDto("rateConfidence")));

        // 3. Projects completed (weighted towards the portfolio project).
        var projectScore = summaries.Sum(p => p.Percent * ProjectWeights.GetValueOrDefault(p.Order, 0.25));
        var nextProject = summaries.FirstOrDefault(p => p.Status != "completed");
        areas.Add(Area("projects", Math.Round(projectScore, 1),
            [new("projectsCompleted", summaries.Count(p => p.Status == "completed"), summaries.Count),
             new("tasksCompleted", summaries.Sum(p => p.CompletedTasks), summaries.Sum(p => p.TotalTasks))],
            nextProject is null ? new ReasonDto("polishPortfolio") : ProjectReason("continueProject", nextProject)));

        // 4. Features delivered in the API and full-stack projects, including change requests.
        var featureProjects = summaries.Where(p => p.Order is 2 or 4).ToList();
        var featureTotal = featureProjects.Sum(p => p.TotalTasks);
        var featureDone = featureProjects.Sum(p => p.CompletedTasks);
        var crTotal = await db.ProjectTasks.CountAsync(t => t.IsChangeRequest, ct);
        var crDone = summaries.Sum(p => p.ChangeRequestsDone);
        areas.Add(Area("features", Pct(featureDone + crDone, featureTotal + crTotal),
            [new("featureTasksDone", featureDone, featureTotal), new("changeRequestsDone", crDone, crTotal)],
            featureProjects.FirstOrDefault(p => p.Status != "completed") is { } fp ? ProjectReason("continueProject", fp)
                : new ReasonDto("tryChangeRequests")));

        // 5. Tests written: project tasks about testing + testing topics.
        var testingTopicIds = state.Topics.Where(t => t.Skill == SkillArea.Testing).Select(t => t.Id).ToList();
        var testTasks = await db.ProjectTasks.AsNoTracking()
            .Where(t => t.TopicLinks.Any(l => testingTopicIds.Contains(l.TopicId)))
            .Select(t => t.Progress != null && t.Progress.Status == ProjectTaskStatus.Completed)
            .ToListAsync(ct);
        var testTopicsDone = state.Topics.Count(t => t.Skill == SkillArea.Testing && t.IsDone);
        var testScore = 0.6 * Pct(testTasks.Count(x => x), testTasks.Count) + 0.4 * Pct(testTopicsDone, testingTopicIds.Count);
        var nextTesting = state.Topics.FirstOrDefault(t => t.Skill == SkillArea.Testing && !t.IsDone);
        areas.Add(Area("testing", Math.Round(testScore, 1),
            [new("testTasksDone", testTasks.Count(x => x), testTasks.Count), new("testTopicsDone", testTopicsDone, testingTopicIds.Count)],
            nextTesting is null ? new ReasonDto("writeMoreTests") : TopicReason("studyTopic", nextTesting)));

        // 6. Debugging & problem solving: debugging, scenario and code review exercises.
        var debugTypes = new[] { ExerciseType.Debugging, ExerciseType.Scenario, ExerciseType.CodeReview };
        var debug = await db.PracticeExercises.AsNoTracking()
            .Where(e => debugTypes.Contains(e.Type))
            .Select(e => new { e.Type, Done = e.Progress != null && e.Progress.Status == PracticeStatus.Completed })
            .ToListAsync(ct);
        areas.Add(Area("debugging", Pct(debug.Count(d => d.Done), debug.Count),
            debugTypes.Select(t => new EvidenceDto($"{char.ToLowerInvariant(t.ToString()[0])}{t.ToString()[1..]}Done",
                debug.Count(d => d.Type == t && d.Done), debug.Count(d => d.Type == t))).ToList(),
            new ReasonDto("practiceDebugging")));

        // 7. Interview practice: confident = 1, partial = 0.5.
        var ratings = await db.InterviewQuestions.AsNoTracking()
            .Select(q => q.Progress != null ? (InterviewRating?)q.Progress.Rating : null).ToListAsync(ct);
        var interviewPoints = ratings.Sum(r => r == InterviewRating.Confident ? 1 : r == InterviewRating.Partial ? 0.5 : 0);
        areas.Add(Area("interview", Pct(interviewPoints, ratings.Count),
            [new("questionsConfident", ratings.Count(r => r == InterviewRating.Confident), ratings.Count),
             new("questionsPracticed", ratings.Count(r => r != null), ratings.Count)],
            new ReasonDto("practiceInterview")));

        // 8. Portfolio quality checklist (README, screenshots, setup instructions...).
        var checklist = await db.PortfolioChecklistItems.AsNoTracking().OrderBy(i => i.Order).ToListAsync(ct);
        var checks = await db.PortfolioChecks.AsNoTracking().Where(c => c.IsDone).ToListAsync(ct);
        var portfolioTotal = checklist.Count * summaries.Count;
        areas.Add(Area("portfolio", Pct(checks.Count, portfolioTotal),
            [new("portfolioItemsDone", checks.Count, portfolioTotal)],
            new ReasonDto("completeChecklist")));

        var portfolio = summaries.Select(p => new ProjectPortfolioDto(p.Id, p.Slug, p.TitleEn, p.TitleAr,
            checklist.Select(i => new PortfolioItemDto(i.Id, i.Key, i.TitleEn, i.TitleAr, i.DescriptionEn, i.DescriptionAr,
                checks.Any(c => c.ProjectId == p.Id && c.ChecklistItemId == i.Id))).ToList())).ToList();

        var gaps = areas.OrderBy(a => a.Score).Where(a => a.Score < 50).Take(3).Select(a => a.Key).ToList();
        return new CareerReadinessDto(areas, gaps, portfolio);
    }

    private static double Pct(double done, double total) => total <= 0 ? 0 : Math.Round(done / total * 100, 1);

    public static string LevelFor(double score) => score switch
    {
        < 25 => "gap",
        < 50 => "developing",
        < 80 => "solid",
        _ => "strong"
    };

    private static ReadinessAreaDto Area(string key, double score, IReadOnlyList<EvidenceDto> evidence, ReasonDto next) =>
        new(key, score, LevelFor(score), evidence, next);

    private static ReasonDto TopicReason(string code, TopicState t) =>
        new(code, new Dictionary<string, string> { ["en"] = t.TitleEn, ["ar"] = t.TitleAr, ["topicId"] = t.Id.ToString() });

    private static ReasonDto ProjectReason(string code, ProjectSummaryDto p) =>
        new(code, new Dictionary<string, string> { ["en"] = p.TitleEn, ["ar"] = p.TitleAr, ["projectId"] = p.Id.ToString() });
}
