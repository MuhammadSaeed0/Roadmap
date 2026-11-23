using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Spaced review with one transparent rule: the next review date depends only on
/// how confident you feel at the end of a review.
///
///   confidence 0–1 → 1 day, 2 → 2 days, 3 → 4 days, 4 → 8 days, 5 → 16 days
///
/// Low confidence brings the topic back soon; high confidence pushes it further out.
/// </summary>
public static class ReviewRules
{
    private static readonly int[] DaysByConfidence = [1, 1, 2, 4, 8, 16];

    public static int IntervalDays(int? confidence) => DaysByConfidence[Math.Clamp(confidence ?? 0, 0, 5)];

    public static IReadOnlyList<ReviewRuleDto> Table =>
        DaysByConfidence.Select((days, confidence) => new ReviewRuleDto(confidence, days)).ToList();
}

public class ReviewService(AppDbContext db, TimeProvider clock)
{
    private DateOnly Today() => DateOnly.FromDateTime(clock.GetLocalNow().DateTime);

    public async Task<ReviewQueueDto> GetQueueAsync(CancellationToken ct)
    {
        var today = Today();
        var items = await db.ReviewSchedules.AsNoTracking()
            .OrderBy(r => r.NextReviewOn).ThenBy(r => r.TopicId)
            .Select(r => new
            {
                r.TopicId, r.Topic.Slug, r.Topic.TitleEn, r.Topic.TitleAr, r.Topic.Skill,
                Confidence = r.Topic.ProgressRows.Select(p => p.Confidence).FirstOrDefault(),
                r.IntervalDays, r.NextReviewOn, r.LastReviewedOn, r.ReviewCount
            })
            .ToListAsync(ct);

        var dtos = items.Select(r => new ReviewItemDto(r.TopicId, r.Slug, r.TitleEn, r.TitleAr, r.Skill, r.Confidence,
            r.IntervalDays, r.NextReviewOn, r.LastReviewedOn, r.ReviewCount,
            Math.Max(0, today.DayNumber - r.NextReviewOn.DayNumber))).ToList();

        // Suggestions: finished topics with low confidence that aren't in the queue yet.
        var suggested = await db.TopicProgress.AsNoTracking()
            .Where(p => p.Status == TopicStatus.Completed && p.Confidence != null && p.Confidence <= 2
                        && !p.Topic.ReviewRows.Any())
            .OrderBy(p => p.Confidence).ThenBy(p => p.Topic.Phase.Order).ThenBy(p => p.Topic.Order)
            .Take(6)
            .Select(p => new TopicRefDto(p.TopicId, p.Topic.Slug, p.Topic.TitleEn, p.Topic.TitleAr, p.Topic.Skill, p.Status))
            .ToListAsync(ct);

        return new ReviewQueueDto(
            dtos.Where(d => d.NextReviewOn <= today).ToList(),
            dtos.Where(d => d.NextReviewOn > today).ToList(),
            suggested, ReviewRules.Table);
    }

    public async Task<int> CountDueAsync(CancellationToken ct)
    {
        var today = Today();
        return await db.ReviewSchedules.CountAsync(r => r.NextReviewOn <= today, ct);
    }

    /// <summary>Adds a topic to the review queue. Adding it twice is harmless (idempotent).</summary>
    public async Task<ReviewStateDto> AddAsync(int topicId, CancellationToken ct)
    {
        var topic = await db.Topics.Include(t => t.ProgressRows).Include(t => t.ReviewRows)
            .SingleOrDefaultAsync(t => t.Id == topicId, ct) ?? throw new NotFoundException("Topic", topicId);

        // Both collections were loaded with the query filter: at most the signed-in user's row each.
        var schedule = topic.ReviewRows.FirstOrDefault();
        if (schedule is null)
        {
            var interval = ReviewRules.IntervalDays(topic.ProgressRows.FirstOrDefault()?.Confidence);
            schedule = new ReviewSchedule
            {
                TopicId = topicId,
                IntervalDays = interval,
                NextReviewOn = Today().AddDays(interval),
                CreatedAt = clock.GetUtcNow().UtcDateTime
            };
            topic.ReviewRows.Add(schedule);
            await db.SaveChangesAsync(ct);
        }
        return ToState(schedule);
    }

    /// <summary>Records a finished review and reschedules it using the new confidence.</summary>
    public async Task<ReviewStateDto> CompleteAsync(int topicId, int confidence, CancellationToken ct)
    {
        var schedule = await db.ReviewSchedules.Include(r => r.Topic).ThenInclude(t => t.ProgressRows)
            .SingleOrDefaultAsync(r => r.TopicId == topicId, ct) ?? throw new NotFoundException("ReviewSchedule", topicId);

        var now = clock.GetUtcNow().UtcDateTime;
        var today = Today();
        schedule.IntervalDays = ReviewRules.IntervalDays(confidence);
        schedule.LastReviewedOn = today;
        schedule.NextReviewOn = today.AddDays(schedule.IntervalDays);
        schedule.ReviewCount++;

        // Reviewing also updates the topic's confidence — one source of truth.
        var progress = schedule.Topic.ProgressRows.FirstOrDefault();
        if (progress is null)
        {
            progress = new TopicProgress { TopicId = topicId, Status = TopicStatus.InProgress, StartedAt = now };
            db.TopicProgress.Add(progress);
        }
        progress.Confidence = confidence;
        progress.UpdatedAt = now;

        await db.SaveChangesAsync(ct);
        return ToState(schedule);
    }

    /// <summary>Cards per quick review: one from the objectives when the topic has any, the rest from its quiz questions.</summary>
    public const int CardsPerTopic = 4;

    public async Task<FlashcardDeckDto> CardsAsync(int topicId, CancellationToken ct)
    {
        var topic = await db.Topics.AsNoTracking()
            .Where(t => t.Id == topicId)
            .Select(t => new { t.Id, t.TitleEn, t.TitleAr, t.SummaryEn, t.SummaryAr, t.WhyEn, t.WhyAr, t.ObjectivesEn, t.ObjectivesAr })
            .SingleOrDefaultAsync(ct) ?? throw new NotFoundException("Topic", topicId);
        var questions = await db.QuizQuestions.AsNoTracking().Where(q => q.TopicId == topicId).ToListAsync(ct);
        return new FlashcardDeckDto(topic.Id, topic.TitleEn, topic.TitleAr,
            BuildCards(topic.SummaryEn, topic.SummaryAr, topic.WhyEn, topic.WhyAr, topic.ObjectivesEn, topic.ObjectivesAr, questions, Random.Shared));
    }

    /// <summary>Builds a topic's deck: at most one objective card, then quiz questions in a random order, CardsPerTopic in all.</summary>
    public static List<FlashcardDto> BuildCards(string summaryEn, string summaryAr, string whyEn, string whyAr,
        string objectivesEn, string objectivesAr, IReadOnlyList<QuizQuestion> questions, Random random)
    {
        var cards = new List<FlashcardDto>();
        var en = Lines(objectivesEn);
        var ar = Lines(objectivesAr);
        if (en.Count > 0 && en.Count == ar.Count)
        {
            var i = random.Next(en.Count);
            cards.Add(new FlashcardDto("objective", en[i], ar[i], summaryEn, summaryAr, FirstSentence(whyEn), FirstSentence(whyAr)));
        }
        var shuffled = questions.ToArray();
        random.Shuffle(shuffled);
        foreach (var q in shuffled.Take(CardsPerTopic - cards.Count))
            cards.Add(new FlashcardDto("question", q.QuestionEn, q.QuestionAr, q.OptionsEn[q.AnswerIndex], q.OptionsAr[q.AnswerIndex],
                FirstSentence(q.ExplanationEn), FirstSentence(q.ExplanationAr)));
        return cards;

        static List<string> Lines(string text) => text.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
    }

    /// <summary>The first sentence of a text, for the one-line "why" on the back of a card.</summary>
    public static string FirstSentence(string text)
    {
        text = text.Trim();
        for (var i = 0; i < text.Length - 1; i++)
            if (text[i] is '.' or '!' or '?' or '؟' && char.IsWhiteSpace(text[i + 1]) && !EndsWithAbbreviation(text, i))
                return text[..(i + 1)];
        return text;

        // "e.g. net10.0" must not end the sentence after "e.g.".
        static bool EndsWithAbbreviation(string text, int dot) =>
            dot >= 3 && text.AsSpan(dot - 3, 3) is "e.g" or "i.e";
    }

    public async Task RemoveAsync(int topicId, CancellationToken ct)
    {
        if (await db.ReviewSchedules.Where(r => r.TopicId == topicId).ExecuteDeleteAsync(ct) == 0)
            throw new NotFoundException("ReviewSchedule", topicId);
    }

    private ReviewStateDto ToState(ReviewSchedule r) =>
        new(r.IntervalDays, r.NextReviewOn, r.LastReviewedOn, r.ReviewCount, r.NextReviewOn <= Today());
}
