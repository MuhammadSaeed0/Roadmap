using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Challenges: the Practice Lab exercises that have automatic checks, with points, a history of the learner's
/// submissions. The checks run in each learner's browser, so points are self-reported: a personal record, not proof.
/// </summary>
public class ChallengeService(AppDbContext db)
{
    public const string AlgorithmsDomain = "Algorithms";

    public static int PointsFor(Difficulty difficulty) => difficulty switch
    {
        Difficulty.Beginner => 10,
        Difficulty.Intermediate => 20,
        Difficulty.Advanced => 40,
        _ => 60,
    };

    /// <summary>Challenge sets with their own domain, by key prefix. Every other challenge belongs to its topic's technology.</summary>
    private static readonly (string Prefix, string Domain)[] Domains =
    [
        ("algo-", AlgorithmsDomain), ("ds-", "DataStructures"), ("str-", "Strings"), ("math-", "Math"),
        ("oopc-", "ObjectOriented"), ("linqc-", "Linq"),
    ];

    public static string DomainOf(string key, SkillArea skill)
    {
        foreach (var (prefix, domain) in Domains)
            if (key.StartsWith(prefix, StringComparison.Ordinal)) return domain;
        return skill.ToString();
    }

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
