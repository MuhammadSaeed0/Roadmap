using DevPath.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Controllers;

/// <summary>The roadmap's names and ids (phases, topics, built-in paths), without anyone's progress.</summary>
public record CatalogDto(IReadOnlyList<CatalogPhaseDto> Phases, IReadOnlyList<CatalogPathDto> Paths);
public record CatalogPhaseDto(int Id, string Slug, int Order, string TitleEn, string TitleAr, IReadOnlyList<CatalogTopicDto> Topics);
public record CatalogTopicDto(int Id, string Slug, string TitleEn, string TitleAr);
public record CatalogPathDto(int Id, string Slug, string NameEn, string NameAr);

/// <summary>
/// Public, read-only: lets pages that anyone may read (the Pre-Roadmap page) link into the roadmap by slug.
/// It holds only seeded content, never user data; the links themselves still lead to sign-in when signed out.
/// </summary>
[ApiController]
[AllowAnonymous]
public class CatalogController(AppDbContext db) : ControllerBase
{
    [HttpGet("api/catalog")]
    [ResponseCache(Duration = 600, Location = ResponseCacheLocation.Any)]
    public async Task<CatalogDto> Get(CancellationToken ct)
    {
        var topics = (await db.Topics.AsNoTracking().OrderBy(t => t.Order)
                .Select(t => new { t.PhaseId, Topic = new CatalogTopicDto(t.Id, t.Slug, t.TitleEn, t.TitleAr) }).ToListAsync(ct))
            .ToLookup(t => t.PhaseId, t => t.Topic);
        var phases = await db.Phases.AsNoTracking().OrderBy(p => p.Order)
            .Select(p => new { p.Id, p.Slug, p.Order, p.TitleEn, p.TitleAr }).ToListAsync(ct);
        var paths = await db.LearningPaths.AsNoTracking().Where(p => p.IsBuiltIn).OrderBy(p => p.Id)
            .Select(p => new CatalogPathDto(p.Id, p.Slug, p.NameEn, p.NameAr)).ToListAsync(ct);
        return new CatalogDto(
            phases.Select(p => new CatalogPhaseDto(p.Id, p.Slug, p.Order, p.TitleEn, p.TitleAr, topics[p.Id].ToList())).ToList(),
            paths);
    }
}
