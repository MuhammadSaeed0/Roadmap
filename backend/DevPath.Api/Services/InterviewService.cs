using System.Linq.Expressions;
using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

public class InterviewService(AppDbContext db, TimeProvider clock, ContentCache cache)
{
    private record QuestionRow(int Id, string Key, InterviewCategory Category, int TopicId, Difficulty Difficulty,
        string QuestionEn, string QuestionAr, string AnswerEn, string AnswerAr, string? ExampleCode, string? FollowUpEn, string? FollowUpAr);
    private record TopicTitle(string TitleEn, string TitleAr);

    private static readonly Expression<Func<InterviewQuestion, InterviewQuestionDto>> Projection = q => new InterviewQuestionDto(
        q.Id, q.Key, q.Category, q.TopicId, q.Topic.TitleEn, q.Topic.TitleAr, q.Difficulty,
        q.QuestionEn, q.QuestionAr, q.AnswerEn, q.AnswerAr, q.ExampleCode, q.FollowUpEn, q.FollowUpAr,
        // ProgressRows holds at most the signed-in user's row (query filter).
        q.ProgressRows.Select(p => (InterviewRating?)p.Rating).FirstOrDefault(),
        q.ProgressRows.Select(p => p.TimesPracticed).FirstOrDefault(),
        q.ProgressRows.Select(p => (DateTime?)p.LastPracticedAt).FirstOrDefault());

    public async Task<InterviewListDto> ListAsync(InterviewCategory? category, int? topicId, string? rating, CancellationToken ct, IReadOnlySet<int>? roadmapTopics = null)
    {
        // Enums are stored as strings, so ORDER BY in SQL would sort them alphabetically
        // ("Advanced" before "Beginner"). Sorting in memory uses the enum's declared order.
        // The questions, their topic titles and the account's ratings are read separately and joined here.
        // Joining them in SQL made the server request a memory grant sized for the long answer texts, which
        // on a memory-limited server (shared hosting) waited ~25 s; a plain scan of the questions needs none.
        // The questions and topic titles are catalogue content (cached); only the account's ratings are read per request.
        var topics = await cache.GetAsync("interview-topics", db.ShowDrafts, () => db.Topics.AsNoTracking()
            .ToDictionaryAsync(t => t.Id, t => new TopicTitle(t.TitleEn, t.TitleAr), CancellationToken.None));
        var progress = await db.InterviewProgress.AsNoTracking()
            .Select(p => new { p.QuestionId, p.Rating, p.TimesPracticed, p.LastPracticedAt })
            .ToDictionaryAsync(p => p.QuestionId, ct);
        var questions = (await cache.GetAsync("interview-questions", db.ShowDrafts, () => db.InterviewQuestions.AsNoTracking()
                .Select(q => new QuestionRow(q.Id, q.Key, q.Category, q.TopicId, q.Difficulty, q.QuestionEn, q.QuestionAr,
                    q.AnswerEn, q.AnswerAr, q.ExampleCode, q.FollowUpEn, q.FollowUpAr))
                .ToListAsync(CancellationToken.None)))
            .Where(q => roadmapTopics == null || roadmapTopics.Contains(q.TopicId))
            .ToList();
        var all = questions
            .Select(q =>
            {
                var topic = topics.GetValueOrDefault(q.TopicId);
                var p = progress.GetValueOrDefault(q.Id);
                return new InterviewQuestionDto(q.Id, q.Key, q.Category, q.TopicId, topic?.TitleEn ?? "", topic?.TitleAr ?? "", q.Difficulty,
                    q.QuestionEn, q.QuestionAr, q.AnswerEn, q.AnswerAr, q.ExampleCode, q.FollowUpEn, q.FollowUpAr,
                    p?.Rating, p?.TimesPracticed ?? 0, p?.LastPracticedAt);
            })
            .OrderBy(q => q.Category).ThenBy(q => q.Difficulty).ThenBy(q => q.Id)
            .ToList();

        var stats = Enum.GetValues<InterviewCategory>()
            .Select(c => all.Where(q => q.Category == c).ToList())
            .Where(list => list.Count > 0)
            .Select(list => new InterviewCategoryStatsDto(list[0].Category, list.Count,
                list.Count(q => q.Rating == InterviewRating.Confident),
                list.Count(q => q.Rating == InterviewRating.Partial),
                list.Count(q => q.Rating == InterviewRating.NeedReview)))
            .ToList();

        var filtered = all
            .Where(q => category == null || q.Category == category)
            .Where(q => topicId == null || q.TopicId == topicId)
            .Where(q => rating switch
            {
                null or "" => true,
                "unrated" => q.Rating == null,
                _ => Enum.TryParse<InterviewRating>(rating, true, out var r) && q.Rating == r
            })
            .ToList();

        return new InterviewListDto(filtered, stats);
    }

    public async Task<InterviewQuestionDto> GetAsync(int id, CancellationToken ct) =>
        await db.InterviewQuestions.AsNoTracking().Where(q => q.Id == id).Select(Projection).SingleOrDefaultAsync(ct)
        ?? throw new NotFoundException("InterviewQuestion", id);

    public async Task<InterviewQuestionDto> RateAsync(int id, InterviewRating rating, CancellationToken ct)
    {
        if (!await db.InterviewQuestions.AnyAsync(q => q.Id == id, ct)) throw new NotFoundException("InterviewQuestion", id);

        var progress = await db.InterviewProgress.SingleOrDefaultAsync(p => p.QuestionId == id, ct);
        if (progress is null)
        {
            progress = new InterviewProgress { QuestionId = id };
            db.InterviewProgress.Add(progress);
        }
        progress.Rating = rating;
        progress.TimesPracticed++;
        progress.LastPracticedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);

        return await GetAsync(id, ct);
    }
}
