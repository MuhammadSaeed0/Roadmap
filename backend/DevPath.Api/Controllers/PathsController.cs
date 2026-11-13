using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Controllers;

[ApiController]
[Route("api/paths")]
public class PathsController(AppDbContext db, ICurrentUser currentUser, TimeProvider clock) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PathSummaryDto>>> List(CancellationToken ct)
    {
        var userId = currentUser.Id;
        return Ok(await SummariesAsync(db.LearningPaths.Where(p => p.IsPublic || p.CreatorId == userId), ct));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PathDetailDto>> Get(int id, CancellationToken ct)
    {
        var userId = currentUser.Id;
        // Projections only: loading Topic entities would drag every lesson text column along.
        var p = await db.LearningPaths.AsNoTracking().Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id, x.Slug, x.NameEn, x.NameAr, x.DescriptionEn, x.DescriptionAr, x.IconName,
                x.IsBuiltIn, x.IsPublic, x.CreatorId, CreatorName = x.Creator != null ? x.Creator.FullName : null, x.CreatedAt,
            })
            .FirstOrDefaultAsync(ct);
        if (p is null) return NotFound();
        if (!p.IsPublic && p.CreatorId != userId) return Forbid();

        var completed = await CompletedTopicIdsAsync(ct);
        var isActivated = userId is not null && await db.UserLearningPaths.AnyAsync(u => u.LearningPathId == id, ct);
        string Status(int topicId) => completed.Contains(topicId) ? "Completed" : "Pending";

        var phaseRows = await db.LearningPathPhases.AsNoTracking().Where(pp => pp.LearningPathId == id)
            .OrderBy(pp => pp.SortOrder)
            .Select(pp => new { pp.PhaseId, pp.Phase.TitleEn, pp.Phase.TitleAr, pp.SortOrder })
            .ToListAsync(ct);
        var phaseIds = phaseRows.Select(r => r.PhaseId).ToList();
        var phaseTopics = (await db.Topics.AsNoTracking().Where(t => phaseIds.Contains(t.PhaseId))
                .Select(t => new { t.Id, t.PhaseId, t.TitleEn, t.TitleAr, t.Order }).ToListAsync(ct))
            .ToLookup(t => t.PhaseId);

        var phases = phaseRows.Select(r => new PathPhaseDto(r.PhaseId, r.TitleEn, r.TitleAr, r.SortOrder,
            phaseTopics[r.PhaseId].OrderBy(t => t.Order)
                .Select(t => new PathTopicDto(t.Id, t.TitleEn, t.TitleAr, t.Order, Status(t.Id))).ToList())).ToList();

        var topics = (await db.LearningPathTopics.AsNoTracking().Where(lt => lt.LearningPathId == id)
                .OrderBy(lt => lt.SortOrder)
                .Select(lt => new { lt.TopicId, lt.Topic.TitleEn, lt.Topic.TitleAr, lt.SortOrder })
                .ToListAsync(ct))
            .Select(t => new PathTopicDto(t.TopicId, t.TitleEn, t.TitleAr, t.SortOrder, Status(t.TopicId))).ToList();

        return Ok(new PathDetailDto(
            p.Id, p.Slug, p.NameEn, p.NameAr,
            p.DescriptionEn, p.DescriptionAr, p.IconName,
            p.IsBuiltIn, p.IsPublic, p.CreatorId, p.CreatorName,
            p.CreatedAt, isActivated, phases, topics));
    }

    [HttpPost]
    public async Task<ActionResult<PathDetailDto>> Create(CreatePathRequest request, CancellationToken ct)
    {
        if (request.TopicIds.Length is 0 or > 50)
            return BadRequest(Problem("A custom path must have 1-50 topics", statusCode: 400));

        var slug = string.IsNullOrWhiteSpace(request.Slug) ? $"custom-{Guid.NewGuid():N}" : request.Slug.Trim();
        if (await db.LearningPaths.AnyAsync(p => p.Slug == slug, ct))
            return Conflict(Problem("A path with this slug already exists", statusCode: 409));

        var validTopicIds = await db.Topics.Where(t => request.TopicIds.Contains(t.Id)).Select(t => t.Id).ToListAsync(ct);
        if (validTopicIds.Count != request.TopicIds.Length)
            return BadRequest(Problem("Some topic IDs are invalid", statusCode: 400));

        var now = clock.GetUtcNow().UtcDateTime;
        var path = new LearningPath
        {
            CreatorId = currentUser.Id,
            Slug = slug,
            NameEn = request.NameEn, NameAr = request.NameAr,
            DescriptionEn = request.DescriptionEn ?? "", DescriptionAr = request.DescriptionAr ?? "",
            IconName = request.IconName ?? "route",
            IsBuiltIn = false, IsPublic = false,
            CreatedAt = now
        };

        for (var i = 0; i < request.TopicIds.Length; i++)
            path.Topics.Add(new LearningPathTopic { TopicId = request.TopicIds[i], SortOrder = i });

        db.LearningPaths.Add(path);
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = path.Id }, await BuildDetail(path.Id, ct));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PathDetailDto>> Update(int id, UpdatePathRequest request, CancellationToken ct)
    {
        var p = await db.LearningPaths.Include(x => x.Topics).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return NotFound();
        if (p.IsBuiltIn || p.CreatorId != currentUser.Id) return Forbid();
        if (request.TopicIds.Length is 0 or > 50)
            return BadRequest(Problem("A custom path must have 1-50 topics", statusCode: 400));

        p.NameEn = request.NameEn; p.NameAr = request.NameAr;
        p.DescriptionEn = request.DescriptionEn ?? ""; p.DescriptionAr = request.DescriptionAr ?? "";
        p.IconName = request.IconName ?? "route";

        p.Topics.Clear();
        for (var i = 0; i < request.TopicIds.Length; i++)
            p.Topics.Add(new LearningPathTopic { TopicId = request.TopicIds[i], SortOrder = i });

        await db.SaveChangesAsync(ct);
        return Ok(await BuildDetail(id, ct));
    }

    private async Task<PathDetailDto> BuildDetail(int id, CancellationToken ct)
        => (await Get(id, ct)).Result is OkObjectResult ok ? (PathDetailDto)ok.Value! : throw new InvalidOperationException();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var p = await db.LearningPaths.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return NotFound();
        if (p.IsBuiltIn || p.CreatorId != currentUser.Id) return Forbid();

        db.LearningPaths.Remove(p);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    // ---------- Activation ----------

    [HttpPost("{id:int}/activate")]
    public async Task<IActionResult> Activate(int id, CancellationToken ct)
    {
        if (!await db.LearningPaths.AnyAsync(p => p.Id == id && (p.IsPublic || p.CreatorId == currentUser.Id), ct))
            return NotFound();

        if (!await db.UserLearningPaths.AnyAsync(u => u.LearningPathId == id, ct))
        {
            db.UserLearningPaths.Add(new UserLearningPath
            {
                LearningPathId = id,
                ActivatedAt = clock.GetUtcNow().UtcDateTime
            });
            await db.SaveChangesAsync(ct);
        }
        return Ok();
    }

    [HttpDelete("{id:int}/activate")]
    public async Task<IActionResult> Deactivate(int id, CancellationToken ct)
    {
        var ul = await db.UserLearningPaths.FirstOrDefaultAsync(u => u.LearningPathId == id, ct);
        if (ul is not null) { db.UserLearningPaths.Remove(ul); await db.SaveChangesAsync(ct); }
        return Ok();
    }

    [HttpGet("active")]
    public async Task<ActionResult<IReadOnlyList<PathSummaryDto>>> Active(CancellationToken ct)
    {
        var userId = currentUser.Id;
        var activePathIds = await db.UserLearningPaths.Select(u => u.LearningPathId).ToListAsync(ct);
        if (activePathIds.Count == 0) return Ok(Array.Empty<PathSummaryDto>());
        return Ok(await SummariesAsync(db.LearningPaths.Where(p => activePathIds.Contains(p.Id) && (p.IsPublic || p.CreatorId == userId)), ct));
    }

    private async Task<HashSet<int>> CompletedTopicIdsAsync(CancellationToken ct) =>
        currentUser.Id is null ? [] :
            (await db.TopicProgress.Where(tp => tp.Status == TopicStatus.Completed).Select(tp => tp.TopicId).ToListAsync(ct)).ToHashSet();

    /// <summary>Path cards with topic counts and progress, built from id-only queries.</summary>
    private async Task<List<PathSummaryDto>> SummariesAsync(IQueryable<LearningPath> query, CancellationToken ct)
    {
        var paths = await query.AsNoTracking()
            .OrderByDescending(p => p.IsBuiltIn).ThenBy(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id, p.Slug, p.NameEn, p.NameAr, p.DescriptionEn, p.DescriptionAr, p.IconName,
                p.IsBuiltIn, p.IsPublic, CreatorName = p.Creator != null ? p.Creator.FullName : null,
            })
            .ToListAsync(ct);
        var ids = paths.Select(p => p.Id).ToList();

        var phaseTopicIds = await (from pp in db.LearningPathPhases
                                   join t in db.Topics on pp.PhaseId equals t.PhaseId
                                   where ids.Contains(pp.LearningPathId)
                                   select new { pp.LearningPathId, TopicId = t.Id }).ToListAsync(ct);
        var pickedTopicIds = await db.LearningPathTopics.Where(lt => ids.Contains(lt.LearningPathId))
            .Select(lt => new { lt.LearningPathId, lt.TopicId }).ToListAsync(ct);
        var topicsByPath = phaseTopicIds.Concat(pickedTopicIds)
            .GroupBy(x => x.LearningPathId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.TopicId).Distinct().ToList());

        var completed = await CompletedTopicIdsAsync(ct);
        var activated = currentUser.Id is null ? [] :
            (await db.UserLearningPaths.Select(u => u.LearningPathId).ToListAsync(ct)).ToHashSet();

        return paths.Select(p =>
        {
            var topicIds = topicsByPath.GetValueOrDefault(p.Id, []);
            var done = topicIds.Count(completed.Contains);
            return new PathSummaryDto(
                p.Id, p.Slug, p.NameEn, p.NameAr, p.DescriptionEn, p.DescriptionAr, p.IconName,
                p.IsBuiltIn, p.IsPublic, p.CreatorName,
                topicIds.Count, topicIds.Count > 0 ? Math.Round(100.0 * done / topicIds.Count, 1) : 0,
                activated.Contains(p.Id));
        }).ToList();
    }
}
