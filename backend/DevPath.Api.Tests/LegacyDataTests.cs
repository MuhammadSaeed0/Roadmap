using System.Net.Http.Json;
using System.Text.Json.Nodes;
using DevPath.Api.Data;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;

namespace DevPath.Api.Tests;

/// <summary>Data from before accounts only moves to an account that is named explicitly and still empty.</summary>
public class LegacyDataTests : IAsyncLifetime
{
    private readonly ApiFactory _factory = new();

    public Task InitializeAsync() => _factory.InitializeAsync();
    public async Task DisposeAsync() => await ((IAsyncLifetime)_factory).DisposeAsync();

    private async Task SeedLegacyRowsAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();   // no signed-in user: system context
        db.Users.Add(new AppUser { Id = LegacyData.UserId, UserName = "legacy-data@devpath.local", Email = "legacy-data@devpath.local",
            NormalizedEmail = "LEGACY-DATA@DEVPATH.LOCAL", NormalizedUserName = "LEGACY-DATA@DEVPATH.LOCAL", FullName = "Data from before accounts" });
        db.TopicProgress.Add(new TopicProgress { UserId = LegacyData.UserId, TopicId = 6, Status = TopicStatus.Completed, Confidence = 4, UpdatedAt = DateTime.UtcNow });
        db.Notes.Add(new Note { UserId = LegacyData.UserId, Title = "Old note", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();
    }

    private async Task<int> AssignAsync(string email)
    {
        using var scope = _factory.Services.CreateScope();
        return await LegacyData.AssignAsync(scope.ServiceProvider.GetRequiredService<AppDbContext>(), email, NullLogger.Instance);
    }

    [Fact]
    public async Task Legacy_rows_are_invisible_until_assigned_then_belong_to_that_account_only()
    {
        await SeedLegacyRowsAsync();
        var owner = await _factory.CreateUserClientAsync("owner@example.com");
        var other = await _factory.CreateUserClientAsync();

        Assert.Empty(JsonNode.Parse(await owner.GetStringAsync("/api/notes"))!.AsArray());   // nobody sees ownerless data

        Assert.Equal(2, await AssignAsync("OWNER@example.com"));

        var notes = JsonNode.Parse(await owner.GetStringAsync("/api/notes"))!.AsArray();
        Assert.Equal("Old note", Assert.Single(notes)!["title"]!.GetValue<string>());
        Assert.Equal("Completed", JsonNode.Parse(await owner.GetStringAsync("/api/topics/6"))!["status"]!.GetValue<string>());
        Assert.Empty(JsonNode.Parse(await other.GetStringAsync("/api/notes"))!.AsArray());

        using var scope = _factory.Services.CreateScope();
        Assert.False(await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users.AnyAsync(u => u.Id == LegacyData.UserId));
    }

    [Fact]
    public async Task Refuses_to_merge_into_an_account_that_already_has_data()
    {
        await SeedLegacyRowsAsync();
        var busy = await _factory.CreateUserClientAsync("busy@example.com");
        await busy.PostAsJsonAsync("/api/notes", new { title = "Mine" });

        Assert.Equal(0, await AssignAsync("busy@example.com"));
        Assert.Equal(0, await AssignAsync("nobody@example.com"));
        Assert.Single(JsonNode.Parse(await busy.GetStringAsync("/api/notes"))!.AsArray());
    }
}
