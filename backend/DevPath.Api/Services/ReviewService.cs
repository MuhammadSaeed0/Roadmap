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
                Confidence = r.Topic.Progress != null ? r.Topic.Progress.Confidence : null,
                r.IntervalDays, r.NextReviewOn, r.LastReviewedOn, r.ReviewCount
            })
            .ToListAsync(ct);

        var dtos = items.Select(r => new ReviewItemDto(r.TopicId, r.Slug, r.TitleEn, r.TitleAr, r.Skill, r.Confidence,
            r.IntervalDays, r.NextReviewOn, r.LastReviewedOn, r.ReviewCount,
            Math.Max(0, today.DayNumber - r.NextReviewOn.DayNumber))).ToList();

        // Suggestions: finished topics with low confidence that aren't in the queue yet.
        var suggested = await db.TopicProgress.AsNoTracking()
            .Where(p => p.Status == TopicStatus.Completed && p.Confidence != null && p.Confidence <= 2
                        && p.Topic.ReviewSchedule == null)
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
        var topic = await db.Topics.Include(t => t.Progress).Include(t => t.ReviewSchedule)
            .SingleOrDefaultAsync(t => t.Id == topicId, ct) ?? throw new NotFoundException("Topic", topicId);

        if (topic.ReviewSchedule is null)
        {
            var interval = ReviewRules.IntervalDays(topic.Progress?.Confidence);
            topic.ReviewSchedule = new ReviewSchedule
            {
                TopicId = topicId,
                IntervalDays = interval,
                NextReviewOn = Today().AddDays(interval),
                CreatedAt = clock.GetUtcNow().UtcDateTime
            };
            await db.SaveChangesAsync(ct);
        }
        return ToState(topic.ReviewSchedule);
    }

    /// <summary>Records a finished review and reschedules it using the new confidence.</summary>
    public async Task<ReviewStateDto> CompleteAsync(int topicId, int confidence, CancellationToken ct)
    {
        var schedule = await db.ReviewSchedules.Include(r => r.Topic).ThenInclude(t => t.Progress)
            .SingleOrDefaultAsync(r => r.TopicId == topicId, ct) ?? throw new NotFoundException("ReviewSchedule", topicId);

        var now = clock.GetUtcNow().UtcDateTime;
        var today = Today();
        schedule.IntervalDays = ReviewRules.IntervalDays(confidence);
        schedule.LastReviewedOn = today;
        schedule.NextReviewOn = today.AddDays(schedule.IntervalDays);
        schedule.ReviewCount++;

        // Reviewing also updates the topic's confidence — one source of truth.
        var progress = schedule.Topic.Progress;
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

    public async Task RemoveAsync(int topicId, CancellationToken ct)
    {
        if (await db.ReviewSchedules.Where(r => r.TopicId == topicId).ExecuteDeleteAsync(ct) == 0)
            throw new NotFoundException("ReviewSchedule", topicId);
    }

    private ReviewStateDto ToState(ReviewSchedule r) =>
        new(r.IntervalDays, r.NextReviewOn, r.LastReviewedOn, r.ReviewCount, r.NextReviewOn <= Today());
}
