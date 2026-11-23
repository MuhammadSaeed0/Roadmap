using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using DevPath.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace DevPath.Api.Tests;

/// <summary>Phase certificates: issued only for finished phases, verifiable by anyone, nothing private exposed.</summary>
public class CertificateTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private static async Task<JsonNode> Json(HttpResponseMessage response)
    {
        Assert.True(response.IsSuccessStatusCode, $"{(int)response.StatusCode}: {await response.Content.ReadAsStringAsync()}");
        return JsonNode.Parse(await response.Content.ReadAsStringAsync())!;
    }

    private static async Task<(int PhaseId, List<int> Topics)> FirstPhaseAsync(HttpClient client)
    {
        var phase = (await Json(await client.GetAsync("/api/roadmap")))["phases"]![0]!;
        return (phase["id"]!.GetValue<int>(), phase["topics"]!.AsArray().Select(t => t!["id"]!.GetValue<int>()).ToList());
    }

    private static async Task FinishAsync(HttpClient client, IEnumerable<int> topics, string status = "Completed")
    {
        foreach (var id in topics)
            (await client.PutAsJsonAsync($"/api/topics/{id}/progress", new { status, knowledge = "AlreadyKnow", confidence = 4 })).EnsureSuccessStatusCode();
    }

    private static Task<HttpResponseMessage> Issue(HttpClient client, int phaseId) =>
        client.PostAsJsonAsync("/api/certificates", new { phaseId });

    [Fact]
    public async Task A_certificate_is_issued_only_once_the_phase_is_finished_and_then_stays_the_same()
    {
        var learner = await factory.CreateUserClientAsync();
        var (phaseId, topics) = await FirstPhaseAsync(learner);

        // One topic left: refused with a code the app translates.
        await FinishAsync(learner, topics.Skip(1), "Skipped");
        var early = await Issue(learner, phaseId);
        Assert.Equal(HttpStatusCode.Conflict, early.StatusCode);
        Assert.Contains("phase_not_finished", await early.Content.ReadAsStringAsync());

        // Skipped topics count as done, like the roadmap and profile badge.
        await FinishAsync(learner, topics.Take(1));
        var first = await Json(await Issue(learner, phaseId));
        var code = first["code"]!.GetValue<string>();
        Assert.Matches("^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{12}$", code);
        Assert.Equal(phaseId, first["phaseId"]!.GetValue<int>());

        // Asking again returns the same certificate; there is one row.
        Assert.Equal(code, (await Json(await Issue(learner, phaseId)))["code"]!.GetValue<string>());
        using var scope = factory.Services.CreateScope();
        Assert.Equal(1, await scope.ServiceProvider.GetRequiredService<AppDbContext>().Certificates.IgnoreQueryFilters().CountAsync(c => c.Code == code));
    }

    [Fact]
    public async Task Anyone_can_verify_a_certificate_and_sees_no_email()
    {
        var learner = await factory.CreateUserClientAsync();
        var (phaseId, topics) = await FirstPhaseAsync(learner);
        await FinishAsync(learner, topics);
        var code = (await Json(await Issue(learner, phaseId)))["code"]!.GetValue<string>();

        var anonymous = factory.CreateClient();
        var response = await anonymous.GetAsync($"/api/certificates/{code}");
        var certificate = await Json(response);
        Assert.Equal(code, certificate["code"]!.GetValue<string>());
        Assert.Equal(1, certificate["phaseOrder"]!.GetValue<int>());
        Assert.Equal(topics.Count, certificate["topicCount"]!.GetValue<int>());
        Assert.False(string.IsNullOrWhiteSpace(certificate["name"]!.GetValue<string>()));
        Assert.False(string.IsNullOrWhiteSpace(certificate["phaseTitleAr"]!.GetValue<string>()));
        Assert.True(DateTime.UtcNow - certificate["issuedAt"]!.GetValue<DateTime>() < TimeSpan.FromMinutes(5));
        var text = certificate.ToJsonString();
        Assert.DoesNotContain("@", text);
        Assert.DoesNotContain("userId", text, StringComparison.OrdinalIgnoreCase);

        // The code is not case-sensitive when typed by hand.
        Assert.Equal(HttpStatusCode.OK, (await anonymous.GetAsync($"/api/certificates/{code.ToLowerInvariant()}")).StatusCode);
    }

    [Fact]
    public async Task Unknown_malformed_and_revoked_codes_are_not_found()
    {
        var anonymous = factory.CreateClient();
        Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync("/api/certificates/ABCDEFGHJKMN")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync("/api/certificates/short")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync("/api/certificates/O0O0O0O0O0O0")).StatusCode);

        var learner = await factory.CreateUserClientAsync();
        var (phaseId, topics) = await FirstPhaseAsync(learner);
        await FinishAsync(learner, topics);
        var code = (await Json(await Issue(learner, phaseId)))["code"]!.GetValue<string>();
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Certificates.IgnoreQueryFilters().Where(c => c.Code == code)
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.RevokedAt, DateTime.UtcNow));
        }
        Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync($"/api/certificates/{code}")).StatusCode);
        // A revoked certificate is not silently re-issued.
        Assert.Equal(HttpStatusCode.Conflict, (await Issue(learner, phaseId)).StatusCode);
    }

    [Fact]
    public async Task Issuing_needs_an_account_and_a_real_phase()
    {
        Assert.Equal(HttpStatusCode.Unauthorized, (await Issue(factory.CreateClient(), 1)).StatusCode);
        var learner = await factory.CreateUserClientAsync();
        Assert.Equal(HttpStatusCode.NotFound, (await Issue(learner, 999999)).StatusCode);
    }

    [Fact]
    public void Codes_are_twelve_unambiguous_characters_and_differ()
    {
        var codes = Enumerable.Range(0, 200).Select(_ => CertificateService.NewCode()).ToList();
        Assert.All(codes, c => Assert.Matches("^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{12}$", c));
        Assert.Equal(codes.Count, codes.Distinct().Count());
    }
}
