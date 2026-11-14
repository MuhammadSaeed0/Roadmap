using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Controllers;

[ApiController]
[Route("api/discussions")]
public class DiscussionsController(AppDbContext db, ICurrentUser currentUser, TimeProvider clock) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedDiscussionsDto>> List(
        [FromQuery] int? topicId, [FromQuery] string sort = "newest", [FromQuery] int page = 1, CancellationToken ct = default)
    {
        const int pageSize = 20;
        page = Math.Max(1, page);
        var userId = currentUser.Id;

        IQueryable<Discussion> q = db.Discussions.AsNoTracking().Include(d => d.Author).Include(d => d.Topic);
        if (topicId.HasValue) q = q.Where(d => d.TopicId == topicId.Value);

        q = sort == "votes"
            ? q.OrderByDescending(d => d.IsPinned).ThenByDescending(d => d.Score).ThenByDescending(d => d.CreatedAt)
            : q.OrderByDescending(d => d.IsPinned).ThenByDescending(d => d.CreatedAt);

        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        var ids = items.Select(d => d.Id).ToList();

        var replyCounts = await db.DiscussionReplies.Where(r => ids.Contains(r.DiscussionId))
            .GroupBy(r => r.DiscussionId).Select(g => new { g.Key, Count = g.Count() }).ToDictionaryAsync(g => g.Key, g => g.Count, ct);

        var myVotes = userId is null ? new Dictionary<int, short>() :
            await db.DiscussionVotes.Where(v => v.DiscussionId != null && ids.Contains(v.DiscussionId!.Value))
                .ToDictionaryAsync(v => v.DiscussionId!.Value, v => v.Value, ct);

        var dtos = items.Select(d => new DiscussionSummaryDto(
            d.Id, d.TopicId, d.Topic.TitleEn, d.Topic.TitleAr,
            d.TitleEn, d.TitleAr, d.BodyEn, d.BodyAr,
            d.Author?.FullName, d.Score, d.IsPinned, d.AcceptedReplyId.HasValue,
            replyCounts.GetValueOrDefault(d.Id), d.CreatedAt,
            myVotes.GetValueOrDefault(d.Id))).ToList();

        return Ok(new PagedDiscussionsDto(dtos, page, pageSize, total));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DiscussionDetailDto>> Get(int id, CancellationToken ct)
    {
        var d = await db.Discussions.AsNoTracking()
            .Include(x => x.Author).Include(x => x.Topic)
            .Include(x => x.Replies.OrderBy(r => r.CreatedAt)).ThenInclude(r => r.Author)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (d is null) return NotFound();

        var userId = currentUser.Id;
        var replyIds = d.Replies.Select(r => r.Id).ToList();
        var allVotes = userId is null ? [] :
            await db.DiscussionVotes
                .Where(v => v.DiscussionId == id || (v.ReplyId != null && replyIds.Contains(v.ReplyId!.Value)))
                .ToListAsync(ct);
        var discussionVote = allVotes.FirstOrDefault(v => v.DiscussionId == id)?.Value;
        var replyVotes = allVotes.Where(v => v.ReplyId.HasValue).ToDictionary(v => v.ReplyId!.Value, v => (int?)v.Value);

        var replies = d.Replies.Select(r => new ReplyDto(
            r.Id, r.DiscussionId, r.AuthorId, r.Author?.FullName,
            r.BodyEn, r.BodyAr, r.Score, r.Id == d.AcceptedReplyId,
            r.CreatedAt, r.UpdatedAt,
            replyVotes.GetValueOrDefault(r.Id))).ToList();

        return Ok(new DiscussionDetailDto(
            d.Id, d.TopicId, d.Topic.TitleEn, d.Topic.TitleAr,
            d.TitleEn, d.TitleAr, d.BodyEn, d.BodyAr,
            d.AuthorId, d.Author?.FullName, d.Score, d.IsPinned,
            d.AcceptedReplyId, d.CreatedAt, d.UpdatedAt,
            (int?)discussionVote, replies));
    }

    [HttpPost]
    public async Task<ActionResult<DiscussionDetailDto>> Create(CreateDiscussionRequest request, CancellationToken ct)
    {
        var topic = await db.Topics.AsNoTracking().FirstOrDefaultAsync(t => t.Id == request.TopicId, ct);
        if (topic is null) return BadRequest(Problem("Topic not found", statusCode: 400));

        var now = clock.GetUtcNow().UtcDateTime;
        var d = new Discussion
        {
            TopicId = request.TopicId!.Value,
            AuthorId = currentUser.Id,
            TitleEn = request.TitleEn, TitleAr = request.TitleAr,
            BodyEn = request.BodyEn, BodyAr = request.BodyAr,
            CreatedAt = now, UpdatedAt = now
        };
        db.Discussions.Add(d);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = d.Id }, await BuildDetailDto(d.Id, ct));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<DiscussionDetailDto>> Update(int id, UpdateDiscussionRequest request, CancellationToken ct)
    {
        var d = await db.Discussions.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (d is null) return NotFound();
        if (d.AuthorId != currentUser.Id) return Forbid();

        d.TitleEn = request.TitleEn; d.TitleAr = request.TitleAr;
        d.BodyEn = request.BodyEn; d.BodyAr = request.BodyAr;
        d.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return Ok(await BuildDetailDto(id, ct));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var d = await db.Discussions.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (d is null) return NotFound();
        if (d.AuthorId != currentUser.Id && !User.IsInRole(Roles.Admin)) return Forbid();

        await InTransactionAsync(async () =>
        {
            await SharedRowCleanup.BeforeDeletingDiscussionAsync(db, id, ct);
            await db.Discussions.Where(x => x.Id == id).ExecuteDeleteAsync(ct);   // replies cascade
        }, ct);
        return NoContent();
    }

    private async Task InTransactionAsync(Func<Task> work, CancellationToken ct)
    {
        var strategy = db.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            await work();
            await tx.CommitAsync(ct);
        });
    }

    // ---------- Replies ----------

    [HttpPost("{id:int}/replies")]
    public async Task<ActionResult<ReplyDto>> CreateReply(int id, CreateReplyRequest request, CancellationToken ct)
    {
        var d = await db.Discussions.Include(x => x.Author).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (d is null) return NotFound();

        var now = clock.GetUtcNow().UtcDateTime;
        var reply = new DiscussionReply
        {
            DiscussionId = id, AuthorId = currentUser.Id,
            BodyEn = request.BodyEn, BodyAr = request.BodyAr,
            CreatedAt = now, UpdatedAt = now
        };
        db.DiscussionReplies.Add(reply);
        await db.SaveChangesAsync(ct);

        if (d.AuthorId is not null && d.AuthorId != currentUser.Id)
        {
            var actor = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == currentUser.Id, ct);
            db.Notifications.Add(new Notification
            {
                RecipientId = d.AuthorId, Kind = NotificationKind.ReplyToDiscussion,
                DiscussionId = id, ActorId = currentUser.Id,
                MessageEn = $"{actor?.FullName ?? "Someone"} replied to your discussion",
                MessageAr = $"رد {actor?.FullName ?? "شخص ما"} على نقاشك",
                CreatedAt = now
            });
            await db.SaveChangesAsync(ct);
        }

        return CreatedAtAction(nameof(Get), new { id },
            new ReplyDto(reply.Id, id, reply.AuthorId, null, reply.BodyEn, reply.BodyAr, 0, false, reply.CreatedAt, reply.UpdatedAt, null));
    }

    [HttpPut("{id:int}/replies/{replyId:int}")]
    public async Task<ActionResult<ReplyDto>> UpdateReply(int id, int replyId, CreateReplyRequest request, CancellationToken ct)
    {
        var reply = await db.DiscussionReplies.Include(r => r.Author).FirstOrDefaultAsync(r => r.Id == replyId && r.DiscussionId == id, ct);
        if (reply is null) return NotFound();
        if (reply.AuthorId != currentUser.Id) return Forbid();

        reply.BodyEn = request.BodyEn; reply.BodyAr = request.BodyAr;
        reply.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return Ok(new ReplyDto(reply.Id, id, reply.AuthorId, reply.Author?.FullName, reply.BodyEn, reply.BodyAr, reply.Score, false, reply.CreatedAt, reply.UpdatedAt, null));
    }

    [HttpDelete("{id:int}/replies/{replyId:int}")]
    public async Task<IActionResult> DeleteReply(int id, int replyId, CancellationToken ct)
    {
        var reply = await db.DiscussionReplies.FirstOrDefaultAsync(r => r.Id == replyId && r.DiscussionId == id, ct);
        if (reply is null) return NotFound();
        if (reply.AuthorId != currentUser.Id && !User.IsInRole(Roles.Admin)) return Forbid();

        await InTransactionAsync(async () =>
        {
            await SharedRowCleanup.BeforeDeletingReplyAsync(db, replyId, ct);
            await db.DiscussionReplies.Where(r => r.Id == replyId).ExecuteDeleteAsync(ct);
        }, ct);
        return NoContent();
    }

    // ---------- Accept ----------

    [HttpPost("{id:int}/accept")]
    public async Task<ActionResult> AcceptReply(int id, AcceptReplyRequest request, CancellationToken ct)
    {
        var d = await db.Discussions.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (d is null) return NotFound();
        if (d.AuthorId != currentUser.Id) return Forbid();

        var reply = await db.DiscussionReplies.FirstOrDefaultAsync(r => r.Id == request.ReplyId && r.DiscussionId == id, ct);
        if (reply is null) return BadRequest(Problem("Reply not found", statusCode: 400));

        d.AcceptedReplyId = reply.Id;
        d.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);

        if (reply.AuthorId is not null && reply.AuthorId != currentUser.Id)
        {
            var now = clock.GetUtcNow().UtcDateTime;
            db.Notifications.Add(new Notification
            {
                RecipientId = reply.AuthorId, Kind = NotificationKind.AnswerAccepted,
                DiscussionId = id, ActorId = currentUser.Id,
                MessageEn = "Your answer was accepted!",
                MessageAr = "تم قبول إجابتك!",
                CreatedAt = now
            });
            await db.SaveChangesAsync(ct);
        }

        return Ok();
    }

    // ---------- Voting ----------

    [HttpPost("{id:int}/vote")]
    public async Task<ActionResult> VoteDiscussion(int id, VoteRequest request, CancellationToken ct)
    {
        if (request.Value is not (1 or -1 or 0)) return BadRequest(Problem("Value must be -1, 0, or 1", statusCode: 400));
        var d = await db.Discussions.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (d is null) return NotFound();

        var existing = await db.DiscussionVotes.FirstOrDefaultAsync(v => v.DiscussionId == id && v.ReplyId == null, ct);
        var delta = 0;
        if (request.Value == 0)
        {
            if (existing is not null) { delta = -existing.Value; db.DiscussionVotes.Remove(existing); }
        }
        else
        {
            if (existing is not null) { delta = request.Value!.Value - existing.Value; existing.Value = request.Value!.Value; }
            else { delta = request.Value!.Value; db.DiscussionVotes.Add(new DiscussionVote { DiscussionId = id, Value = request.Value!.Value }); }
        }

        if (delta != 0)
            await db.Discussions.Where(x => x.Id == id).ExecuteUpdateAsync(s => s.SetProperty(x => x.Score, x => x.Score + delta), ct);

        await db.SaveChangesAsync(ct);
        return Ok(new { score = d.Score + delta });
    }

    [HttpPost("{id:int}/replies/{replyId:int}/vote")]
    public async Task<ActionResult> VoteReply(int id, int replyId, VoteRequest request, CancellationToken ct)
    {
        if (request.Value is not (1 or -1 or 0)) return BadRequest(Problem("Value must be -1, 0, or 1", statusCode: 400));
        var reply = await db.DiscussionReplies.FirstOrDefaultAsync(r => r.Id == replyId && r.DiscussionId == id, ct);
        if (reply is null) return NotFound();

        var existing = await db.DiscussionVotes.FirstOrDefaultAsync(v => v.ReplyId == replyId && v.DiscussionId == null, ct);
        var delta = 0;
        if (request.Value == 0)
        {
            if (existing is not null) { delta = -existing.Value; db.DiscussionVotes.Remove(existing); }
        }
        else
        {
            if (existing is not null) { delta = request.Value!.Value - existing.Value; existing.Value = request.Value!.Value; }
            else { delta = request.Value!.Value; db.DiscussionVotes.Add(new DiscussionVote { ReplyId = replyId, Value = request.Value!.Value }); }
        }

        if (delta != 0)
            await db.DiscussionReplies.Where(r => r.Id == replyId).ExecuteUpdateAsync(s => s.SetProperty(r => r.Score, r => r.Score + delta), ct);

        await db.SaveChangesAsync(ct);
        return Ok(new { score = reply.Score + delta });
    }

    // ---------- Pin (admin only) ----------

    [HttpPost("{id:int}/pin")]
    [Authorize(Policy = Policies.Admin)]
    public async Task<ActionResult> Pin(int id, CancellationToken ct)
    {
        var d = await db.Discussions.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (d is null) return NotFound();
        d.IsPinned = !d.IsPinned;
        await db.SaveChangesAsync(ct);
        return Ok(new { isPinned = d.IsPinned });
    }

    private async Task<DiscussionDetailDto> BuildDetailDto(int id, CancellationToken ct)
        => (await Get(id, ct)).Result is OkObjectResult ok ? (DiscussionDetailDto)ok.Value! : throw new InvalidOperationException();
}

public record PagedDiscussionsDto(IReadOnlyList<DiscussionSummaryDto> Items, int Page, int PageSize, int Total);
