using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationsController(AppDbContext db, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedNotificationsDto>> List(
        [FromQuery] bool unreadOnly = false, [FromQuery] int page = 1, CancellationToken ct = default)
    {
        const int pageSize = 20;
        page = Math.Max(1, page);
        var userId = currentUser.Id!;

        IQueryable<Notification> q = db.Notifications.AsNoTracking()
            .Include(n => n.Actor)
            .Where(n => n.RecipientId == userId);
        if (unreadOnly) q = q.Where(n => !n.IsRead);

        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);

        var dtos = items.Select(n => new NotificationDto(
            n.Id, n.Kind.ToString(), n.DiscussionId,
            n.Actor?.FullName, n.MessageEn, n.MessageAr,
            n.IsRead, n.CreatedAt)).ToList();

        return Ok(new PagedNotificationsDto(dtos, page, pageSize, total));
    }

    [HttpGet("count")]
    public async Task<ActionResult<UnreadCountDto>> UnreadCount(CancellationToken ct)
    {
        var count = await db.Notifications.CountAsync(n => n.RecipientId == currentUser.Id! && !n.IsRead, ct);
        return Ok(new UnreadCountDto(count));
    }

    [HttpPost("read")]
    public async Task<IActionResult> MarkRead(MarkReadRequest request, CancellationToken ct)
    {
        var userId = currentUser.Id!;
        await db.Notifications
            .Where(n => n.RecipientId == userId && request.Ids.Contains(n.Id))
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);
        return Ok();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        var userId = currentUser.Id!;
        await db.Notifications
            .Where(n => n.RecipientId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);
        return Ok();
    }
}

public record PagedNotificationsDto(IReadOnlyList<NotificationDto> Items, int Page, int PageSize, int Total);
