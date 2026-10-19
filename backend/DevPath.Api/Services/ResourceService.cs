using System.Net;
using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

public class ResourceService(AppDbContext db, IHttpClientFactory httpFactory, TimeProvider clock, ILogger<ResourceService> logger)
{
    public const string HttpClientName = "link-checker";

    public async Task<IReadOnlyList<ResourceDto>> ListAsync(int? topicId, ResourceType? type, SkillArea? skill, string? q, CancellationToken ct)
    {
        var query = db.Resources.AsNoTracking()
            .Include(r => r.TopicLinks).ThenInclude(l => l.Topic).ThenInclude(t => t.Progress)
            .AsQueryable();

        if (topicId is { } id) query = query.Where(r => r.TopicLinks.Any(l => l.TopicId == id));
        if (skill is { } s) query = query.Where(r => r.TopicLinks.Any(l => l.Topic.Skill == s));
        if (type is { } t) query = query.Where(r => r.Type == t);
        if (!string.IsNullOrWhiteSpace(q))
        {
            var pattern = SearchService.LikePattern(q);
            query = query.Where(r => EF.Functions.Like(r.TitleEn, pattern) || EF.Functions.Like(r.TitleAr!, pattern)
                                  || EF.Functions.Like(r.SourceName, pattern));
        }

        var list = await query.AsSplitQuery().OrderBy(r => r.Id).ToListAsync(ct);
        return list.Select(ToDto).ToList();
    }

    /// <summary>
    /// Checks every resource URL with a real HTTP request and records the result.
    /// 2xx/3xx → Verified, 404/410 → Broken, anything else (403, 429, 5xx, timeouts)
    /// → left Unverified, because those don't prove the page is gone.
    /// </summary>
    public async Task<LinkCheckResultDto> VerifyAllAsync(CancellationToken ct)
    {
        var resources = await db.Resources.ToListAsync(ct);
        var client = httpFactory.CreateClient(HttpClientName);
        var now = clock.GetUtcNow().UtcDateTime;
        int verified = 0, broken = 0, unreachable = 0;

        // Limit concurrency so we're polite to documentation sites.
        using var gate = new SemaphoreSlim(4);
        var results = await Task.WhenAll(resources.Select(async r =>
        {
            await gate.WaitAsync(ct);
            try { return (Resource: r, Status: await ProbeAsync(client, r.Url, ct)); }
            finally { gate.Release(); }
        }));

        foreach (var (r, status) in results)
        {
            r.LastStatusCode = status;
            if (status is >= 200 and < 400)
            {
                r.VerificationStatus = VerificationStatus.Verified;
                r.LastVerifiedAt = now;
                verified++;
            }
            else if (status is 404 or 410)
            {
                r.VerificationStatus = VerificationStatus.Broken;
                r.LastVerifiedAt = now;
                broken++;
            }
            else
            {
                unreachable++;
            }
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Link check finished: {Verified} verified, {Broken} broken, {Unreachable} unreachable",
            verified, broken, unreachable);
        return new LinkCheckResultDto(resources.Count, verified, broken, unreachable, now);
    }

    private async Task<int?> ProbeAsync(HttpClient client, string url, CancellationToken ct)
    {
        try
        {
            using var head = new HttpRequestMessage(HttpMethod.Head, url);
            using var response = await client.SendAsync(head, HttpCompletionOption.ResponseHeadersRead, ct);
            // Some sites reject HEAD; retry with GET before concluding anything.
            if (response.StatusCode is HttpStatusCode.MethodNotAllowed or HttpStatusCode.Forbidden or HttpStatusCode.NotFound)
            {
                using var get = await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct);
                return (int)get.StatusCode;
            }
            return (int)response.StatusCode;
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException && !ct.IsCancellationRequested)
        {
            logger.LogWarning("Could not reach {Url}: {Message}", url, ex.Message);
            return null;
        }
    }

    public static ResourceDto ToDto(Resource r) => new(
        r.Id, r.Key, r.TitleEn, r.TitleAr, r.Url, r.SourceName, r.Type, r.Difficulty, r.IsFree,
        r.VerificationStatus, r.LastVerifiedAt, r.LastStatusCode,
        r.TopicLinks.Select(l => new TopicRefDto(l.Topic.Id, l.Topic.Slug, l.Topic.TitleEn, l.Topic.TitleAr, l.Topic.Skill,
            l.Topic.Progress?.Status ?? TopicStatus.NotStarted)).ToList());
}
