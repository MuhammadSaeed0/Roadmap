using System.Text.Json;
using DevPath.Api.Data;
using DevPath.Api.Data.Seeding;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>One glossary term as stored in SeedData/glossary.json.</summary>
public record GlossarySeed(string Term, string Arabic, string ShortEn, string ShortAr, string TopicSlug);

/// <summary>A glossary term with the roadmap topic that explains it.</summary>
public record GlossaryTermDto(string Term, string Arabic, string ShortEn, string ShortAr,
    int TopicId, string TopicSlug, string TopicTitleEn, string TopicTitleAr);

/// <summary>
/// The bilingual glossary. The terms ship with the app (SeedData/glossary.json) and the topics are seeded content,
/// so the list is built once on first use and kept for the life of the process.
/// </summary>
public class GlossaryService(IServiceScopeFactory scopes)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private readonly SemaphoreSlim _gate = new(1, 1);
    private IReadOnlyList<GlossaryTermDto>? _terms;

    public static IReadOnlyList<GlossarySeed> LoadSeed(string? seedDirectory = null)
    {
        var path = Path.Combine(seedDirectory ?? DbSeeder.DefaultSeedDirectory, "glossary.json");
        return JsonSerializer.Deserialize<List<GlossarySeed>>(File.ReadAllText(path), Json) ?? [];
    }

    public async Task<IReadOnlyList<GlossaryTermDto>> GetAsync(CancellationToken ct)
    {
        if (_terms is { } ready) return ready;
        await _gate.WaitAsync(ct);
        try
        {
            if (_terms is { } again) return again;
            using var scope = scopes.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var topics = await db.Topics.AsNoTracking()
                .Select(t => new { t.Id, t.Slug, t.TitleEn, t.TitleAr }).ToDictionaryAsync(t => t.Slug, ct);
            // A term whose topic is missing is left out rather than linking nowhere (the seed test keeps this from happening).
            _terms = LoadSeed()
                .Where(s => topics.ContainsKey(s.TopicSlug))
                .Select(s =>
                {
                    var t = topics[s.TopicSlug];
                    return new GlossaryTermDto(s.Term, s.Arabic, s.ShortEn, s.ShortAr, t.Id, t.Slug, t.TitleEn, t.TitleAr);
                })
                .OrderBy(s => s.Term, StringComparer.OrdinalIgnoreCase)
                .ToList();
            return _terms;
        }
        finally
        {
            _gate.Release();
        }
    }
}
