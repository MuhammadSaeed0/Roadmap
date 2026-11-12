using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Challenges: the Practice Lab exercises that have automatic checks, with points, a history of the learner's
/// submissions and a leaderboard. The checks run in each learner's browser, so points are self-reported: the
/// leaderboard is for motivation, not proof.
/// </summary>
public class ChallengeService(AppDbContext db, ICurrentUser currentUser)
{
    public const string AlgorithmsDomain = "Algorithms";

    public static int PointsFor(Difficulty difficulty) => difficulty switch
    {
        Difficulty.Beginner => 10,
        Difficulty.Intermediate => 20,
        Difficulty.Advanced => 40,
        _ => 60,
    };

    /// <summary>Algorithm challenges form their own domain; every other challenge belongs to its topic's technology.</summary>
    public static string DomainOf(string key, SkillArea skill) => key.StartsWith("algo-", StringComparison.Ordinal) ? AlgorithmsDomain : skill.ToString();

    public async Task<ChallengesDto> GetAsync(CancellationToken ct)
    {
        var rows = await db.PracticeExercises.AsNoTracking()
            .Where(e => e.Tests != null && e.Tests != "")
            .Select(e => new
            {
                e.Id, e.Key, e.TitleEn, e.TitleAr, e.Difficulty, e.EstimatedMinutes, e.Runner, e.Topic.Skill,
                P = e.ProgressRows.Select(p => new { p.Status, p.BestScore, p.Submissions }).FirstOrDefault(),
            })
            .ToListAsync(ct);

        var items = rows.Select(r =>
        {
            var solved = r.P?.Status == PracticeStatus.Completed && r.P.BestScore == 100;
            return new ChallengeDto(r.Id, r.Key, r.TitleEn, r.TitleAr, DomainOf(r.Key, r.Skill), r.Difficulty, r.EstimatedMinutes, r.Runner,
                PointsFor(r.Difficulty), solved, r.P?.BestScore, r.P?.Submissions ?? 0);
        })
        // Easiest first (the enum is stored as text, so the database would sort it alphabetically).
        .OrderBy(i => i.Difficulty).ThenBy(i => i.Id).ToList();

        var domains = items.GroupBy(i => i.Domain)
            .Select(g => new ChallengeDomainDto(g.Key, g.Count(), g.Count(i => i.Solved), g.Where(i => i.Solved).Sum(i => i.Points), g.Sum(i => i.Points)))
            .OrderBy(d => d.Key == AlgorithmsDomain ? 0 : 1).ThenBy(d => d.Key)
            .ToList();
        return new ChallengesDto(items, domains, items.Where(i => i.Solved).Sum(i => i.Points), items.Sum(i => i.Points), items.Count(i => i.Solved));
    }

    /// <summary>Approved learners with at least one solved challenge, by points. Names only: no emails.</summary>
    public async Task<IReadOnlyList<LeaderboardRowDto>> LeaderboardAsync(CancellationToken ct)
    {
        // Other accounts' progress is read on purpose here, and only as totals.
        var solved = await db.PracticeProgress.IgnoreQueryFilters().AsNoTracking()
            .Where(p => p.Status == PracticeStatus.Completed && p.BestScore == 100 && p.Exercise.Tests != null && p.Exercise.Tests != "")
            .Select(p => new { p.UserId, p.Exercise.Difficulty })
            .ToListAsync(ct);
        var totals = solved.GroupBy(s => s.UserId)
            .Select(g => new { UserId = g.Key, Points = g.Sum(s => PointsFor(s.Difficulty)), Solved = g.Count() })
            .ToList();
        var ids = totals.Select(t => t.UserId).ToList();
        var names = await db.Users.AsNoTracking()
            .Where(u => ids.Contains(u.Id) && u.Status == AccountStatus.Approved)
            .ToDictionaryAsync(u => u.Id, u => u.FullName, ct);
        var me = currentUser.Id;
        return totals.Where(t => names.ContainsKey(t.UserId))
            .OrderByDescending(t => t.Points).ThenByDescending(t => t.Solved).ThenBy(t => names[t.UserId], StringComparer.OrdinalIgnoreCase)
            .Take(50)
            .Select((t, i) => new LeaderboardRowDto(i + 1, names[t.UserId], t.Points, t.Solved, t.UserId == me))
            .ToList();
    }

    public async Task<IReadOnlyList<SubmissionDto>> SubmissionsAsync(int exerciseId, CancellationToken ct)
    {
        if (!await db.PracticeExercises.AnyAsync(e => e.Id == exerciseId, ct)) throw new NotFoundException("PracticeExercise", exerciseId);
        return await db.PracticeSubmissions.AsNoTracking().Where(s => s.ExerciseId == exerciseId)
            .OrderByDescending(s => s.Id)
            .Select(s => new SubmissionDto(s.Id, s.Passed, s.Total, s.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<SubmissionDetailDto> SubmissionAsync(long id, CancellationToken ct)
    {
        var s = await db.PracticeSubmissions.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new NotFoundException("PracticeSubmission", id);
        return new SubmissionDetailDto(s.Id, s.ExerciseId, s.Passed, s.Total, s.CreatedAt, WorkspaceFiles.Deserialize(s.Files) ?? []);
    }

    public async Task<IReadOnlyList<LessonDto>> LessonsAsync(int topicId, CancellationToken ct)
    {
        if (!await db.Topics.AnyAsync(t => t.Id == topicId, ct)) throw new NotFoundException("Topic", topicId);
        return await db.TopicLessons.AsNoTracking().Where(l => l.TopicId == topicId).OrderBy(l => l.Order)
            .Select(l => new LessonDto(l.Id, l.Key, l.Order, l.TitleEn, l.TitleAr, l.BodyEn, l.BodyAr, l.Code, l.CodeLanguage, l.Output))
            .ToListAsync(ct);
    }
}
