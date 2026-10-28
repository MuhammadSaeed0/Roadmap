using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Short multiple-choice quizzes on a topic page, in three levels that open one after another:
/// 1. the topic itself; 2. the topic mixed with the topics just before it in the roadmap;
/// 3. a wider review of the topics leading up to it. Questions are served without their answers
/// and graded here, so the correct options never reach the browser before the user answers.
/// </summary>
public class QuizService(AppDbContext db, TimeProvider clock)
{
    public const int PassPercent = 75;
    private const int Level2Size = 6;
    private const int Level2Previous = 3;   // topics before this one that level 2 draws from
    private const int Level3Size = 10;
    private const int Level3Previous = 10;  // topics before this one that level 3 draws from
    private const int CurrentTopicShare = 2; // questions from the current topic in levels 2 and 3

    private record Pool(int Level, int Size, IReadOnlyList<int> CurrentIds, IReadOnlyList<int> PreviousIds);

    public async Task<QuizDto> GetAsync(int topicId, int level, CancellationToken ct)
    {
        var (pools, questions) = await LoadAsync(topicId, ct);
        var levels = await LevelsAsync(topicId, pools, ct);
        var pool = Require(pools, levels, level);

        var picked = Pick(pool, questions);
        var dtos = picked.Select(q => new QuizQuestionDto(q.Id, q.TopicId, q.Topic.TitleEn, q.Topic.TitleAr,
            q.QuestionEn, q.QuestionAr, q.OptionsEn, q.OptionsAr)).ToList();
        return new QuizDto(topicId, level, PassPercent, levels, dtos);
    }

    public async Task<QuizResultDto> SubmitAsync(int topicId, SubmitQuizRequest request, CancellationToken ct)
    {
        var level = request.Level!.Value;
        var answers = request.Answers!;
        var (pools, questions) = await LoadAsync(topicId, ct);
        var pool = Require(pools, await LevelsAsync(topicId, pools, ct), level);

        var allowed = pool.CurrentIds.Concat(pool.PreviousIds).ToHashSet();
        var ids = answers.Select(a => a.QuestionId!.Value).ToList();
        if (ids.Count != pool.Size || ids.Distinct().Count() != ids.Count || !ids.All(allowed.Contains))
            throw new RequestValidationException("answers", "quiz_invalid_answers", "Answer every question of this quiz exactly once.");

        var byId = questions.ToDictionary(q => q.Id);
        var results = new List<QuizResultItemDto>();
        foreach (var a in answers)
        {
            var q = byId[a.QuestionId!.Value];
            var choice = a.Choice!.Value;
            if (choice < 0 || choice >= q.OptionsEn.Count)
                throw new RequestValidationException("answers", "quiz_invalid_answers", "An answer points to an option that doesn't exist.");
            results.Add(new QuizResultItemDto(q.Id, choice, q.AnswerIndex, choice == q.AnswerIndex, q.ExplanationEn, q.ExplanationAr));
        }

        var score = results.Count(r => r.IsCorrect);
        db.QuizAttempts.Add(new QuizAttempt
        {
            TopicId = topicId, Level = level, Score = score, Total = results.Count, CreatedAt = clock.GetUtcNow().UtcDateTime,
        });
        await db.SaveChangesAsync(ct);

        return new QuizResultDto(level, score, results.Count, IsPass(score, results.Count), results, await LevelsAsync(topicId, pools, ct));
    }

    /// <summary>The topic's question pools per level, built from the roadmap order (phase, then topic).</summary>
    private async Task<(Dictionary<int, Pool> Pools, List<QuizQuestion> Questions)> LoadAsync(int topicId, CancellationToken ct)
    {
        var order = await db.Topics.AsNoTracking()
            .OrderBy(t => t.Phase.Order).ThenBy(t => t.Order)
            .Select(t => t.Id).ToListAsync(ct);
        var index = order.IndexOf(topicId);
        if (index < 0) throw new NotFoundException("Topic", topicId);

        var previous3 = order.Take(index).TakeLast(Level2Previous).ToList();
        var previous10 = order.Take(index).TakeLast(Level3Previous).ToList();
        var wanted = previous10.Append(topicId).ToList();
        var questions = await db.QuizQuestions.AsNoTracking().Include(q => q.Topic)
            .Where(q => wanted.Contains(q.TopicId)).OrderBy(q => q.Order).ToListAsync(ct);

        List<int> Of(IEnumerable<int> topicIds)
        {
            var set = topicIds.ToHashSet();
            return questions.Where(q => set.Contains(q.TopicId)).Select(q => q.Id).ToList();
        }

        var current = Of([topicId]);
        var pools = new Dictionary<int, Pool> { [1] = new(1, current.Count, current, []) };
        var prev2 = Of(previous3);
        if (prev2.Count > 0 && current.Count > 0)
            pools[2] = new(2, Math.Min(Level2Size, Math.Min(current.Count, CurrentTopicShare) + prev2.Count), current, prev2);
        // Level 3 only makes sense when it reaches further back than level 2.
        var prev3 = Of(previous10);
        if (previous10.Count > previous3.Count && current.Count > 0)
            pools[3] = new(3, Math.Min(Level3Size, Math.Min(current.Count, CurrentTopicShare) + prev3.Count), current, prev3);
        return (pools, questions);
    }

    private async Task<List<QuizLevelDto>> LevelsAsync(int topicId, Dictionary<int, Pool> pools, CancellationToken ct)
    {
        var attempts = await db.QuizAttempts.AsNoTracking().Where(a => a.TopicId == topicId)
            .Select(a => new { a.Level, a.Score, a.Total }).ToListAsync(ct);
        var levels = new List<QuizLevelDto>();
        var previousPassed = true;
        for (var level = 1; level <= 3; level++)
        {
            var mine = attempts.Where(a => a.Level == level).ToList();
            var best = mine.OrderByDescending(a => a.Total == 0 ? 0 : (double)a.Score / a.Total).FirstOrDefault();
            var passed = best is not null && IsPass(best.Score, best.Total);
            var available = pools.TryGetValue(level, out var pool) && pool.Size > 0;
            levels.Add(new QuizLevelDto(level, available, available && previousPassed, available ? pool!.Size : 0,
                best?.Score, best?.Total, passed, mine.Count));
            // An unavailable level doesn't block the next one (e.g. level 2 at the very start of the roadmap).
            if (available) previousPassed = previousPassed && passed;
        }
        return levels;
    }

    private static Pool Require(Dictionary<int, Pool> pools, List<QuizLevelDto> levels, int level)
    {
        var info = levels.FirstOrDefault(l => l.Level == level);
        if (info is null || !info.Available || !pools.TryGetValue(level, out var pool))
            throw new ApiProblemException(404, "quiz_not_available", "This quiz level isn't available for this topic.");
        if (!info.Unlocked)
            throw new ApiProblemException(403, "quiz_locked", "Pass the previous level first.");
        return pool;
    }

    /// <summary>Level 1: every question of the topic, in a new order each time. Levels 2 and 3: a couple from this topic plus a spread over earlier topics.</summary>
    private static List<QuizQuestion> Pick(Pool pool, List<QuizQuestion> questions)
    {
        var byId = questions.ToDictionary(q => q.Id);
        if (pool.Level == 1) return Shuffle(pool.CurrentIds).Select(id => byId[id]).ToList();

        var current = Shuffle(pool.CurrentIds).Take(CurrentTopicShare);
        // Round-robin over earlier topics so one topic doesn't dominate the review.
        var earlier = Shuffle(pool.PreviousIds).Select(id => byId[id]).GroupBy(q => q.TopicId)
            .SelectMany(g => g.Select((q, i) => (q, i))).OrderBy(x => x.i).ThenBy(_ => Random.Shared.Next())
            .Select(x => x.q.Id);
        var ids = current.Concat(earlier).Take(pool.Size);
        return Shuffle(ids).Select(id => byId[id]).ToList();
    }

    private static List<int> Shuffle(IEnumerable<int> ids)
    {
        var list = ids.ToList();
        Random.Shared.Shuffle(System.Runtime.InteropServices.CollectionsMarshal.AsSpan(list));
        return list;
    }

    private static bool IsPass(int score, int total) => total > 0 && score * 100 >= total * PassPercent;
}
