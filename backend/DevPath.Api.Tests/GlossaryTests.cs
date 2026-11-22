using System.Net;
using System.Text.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data.Seeding;
using DevPath.Api.Services;

namespace DevPath.Api.Tests;

/// <summary>The bilingual glossary: valid seed data and the API that serves it.</summary>
public class GlossaryTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static HashSet<string> TopicSlugs() =>
        Directory.GetFiles(Path.Combine(DbSeeder.DefaultSeedDirectory, "roadmap"), "*.json")
            .SelectMany(f => JsonNode.Parse(File.ReadAllText(f))!["topics"]!.AsArray().Select(t => (string)t!["slug"]!))
            .ToHashSet();

    [Fact]
    public void The_seed_has_about_150_unique_complete_terms_linked_to_real_topics()
    {
        var terms = GlossaryService.LoadSeed();
        Assert.InRange(terms.Count, 140, 250);
        Assert.Equal(terms.Count, terms.Select(t => t.Term.ToLowerInvariant()).Distinct().Count());
        Assert.Equal(terms.Count, terms.Select(t => t.Arabic).Distinct().Count());
        var slugs = TopicSlugs();
        Assert.All(terms, t =>
        {
            Assert.Contains(t.TopicSlug, slugs);
            Assert.False(string.IsNullOrWhiteSpace(t.ShortEn), t.Term);
            Assert.Matches(@"[؀-ۿ]", t.Arabic);
            Assert.Matches(@"[؀-ۿ]", t.ShortAr);
        });
    }

    [Fact]
    public async Task The_api_lists_every_term_with_its_topic_for_a_signed_in_learner()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, (await factory.CreateClient().GetAsync("/api/glossary")).StatusCode);

        var client = await factory.CreateUserClientAsync();
        var response = await client.GetAsync("/api/glossary");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var terms = JsonNode.Parse(await response.Content.ReadAsStringAsync())!.AsArray();
        Assert.Equal(GlossaryService.LoadSeed().Count, terms.Count);
        var linq = terms.Single(t => (string)t!["term"]! == "LINQ")!;
        Assert.Equal("linq-fundamentals", (string)linq["topicSlug"]!);
        Assert.True((int)linq["topicId"]! > 0);
        Assert.False(string.IsNullOrEmpty((string)linq["topicTitleAr"]!));
    }
}
