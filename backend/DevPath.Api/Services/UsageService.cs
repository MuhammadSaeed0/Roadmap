using System.Text.RegularExpressions;
using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Anonymous usage counts for the admin page: page views per route pattern per day, and how many learners
/// started and finished Project library projects. Nothing here identifies a person.
/// </summary>
public partial class UsageService(AppDbContext db, TimeProvider clock)
{
    /// <summary>
    /// A route pattern from the app's router: lower-case words and ":param" placeholders, so ids from the URL
    /// ("topics/12") are refused. The empty string is the home page.
    /// </summary>
    [GeneratedRegex(@"^(|([a-z][a-z0-9-]*|:[a-zA-Z]+)(/([a-z][a-z0-9-]*|:[a-zA-Z]+))*)$")]
    private static partial Regex RoutePattern();

    public const int MaxRouteLength = 100;

    public static bool IsValidRoute(string? route) =>
        route is not null && route.Length <= MaxRouteLength && RoutePattern().IsMatch(route);

    /// <summary>Adds one view of a route for today (UTC).</summary>
    public async Task RecordAsync(string route, CancellationToken ct)
    {
        if (!IsValidRoute(route))
            throw new RequestValidationException("route", "invalid", "Send the route pattern, such as \"topics/:id\".");

        var today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        // Increment in the database so concurrent views are not lost; insert the day's row the first time.
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                var updated = await db.PageViews.Where(v => v.Date == today && v.Route == route)
                    .ExecuteUpdateAsync(s => s.SetProperty(v => v.Views, v => v.Views + 1), ct);
                if (updated > 0) return;
                db.PageViews.Add(new PageViewDaily { Date = today, Route = route, Views = 1 });
                await db.SaveChangesAsync(ct);
                return;
            }
            catch (Exception e) when (attempt < 5 && e is DbUpdateException or System.Data.Common.DbException)
            {
                // Another request inserted the day's row first (or held a lock); increment it on the next attempt.
                db.ChangeTracker.Clear();
                await Task.Delay(20 * attempt, ct);
            }
        }
    }

    /// <summary>
    /// The sources the report knows, matching the utm_source values in the owner's marketing links. Anything else
    /// is counted as "other", and no source at all as "direct", so free text never reaches the database.
    /// </summary>
    public static readonly string[] Sources =
        ["direct", "facebook", "whatsapp", "telegram", "linkedin", "reddit", "tiktok", "instagram", "youtube",
         "discord", "github", "google", "devto", "friend", "other"];

    public static string NormalizeSource(string? source)
    {
        var s = source?.Trim().ToLowerInvariant();
        if (string.IsNullOrEmpty(s)) return "direct";
        return Array.IndexOf(Sources, s) >= 0 ? s : "other";
    }

    /// <summary>Counts a guest visit, or a new account, for a source today (UTC).</summary>
    public async Task RecordSourceAsync(string? source, bool signUp, CancellationToken ct)
    {
        var key = NormalizeSource(source);
        var today = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                var rows = db.SourceVisits.Where(v => v.Date == today && v.Source == key);
                var updated = signUp
                    ? await rows.ExecuteUpdateAsync(s => s.SetProperty(v => v.SignUps, v => v.SignUps + 1), ct)
                    : await rows.ExecuteUpdateAsync(s => s.SetProperty(v => v.Visits, v => v.Visits + 1), ct);
                if (updated > 0) return;
                db.SourceVisits.Add(new SourceVisitDaily { Date = today, Source = key, Visits = signUp ? 0 : 1, SignUps = signUp ? 1 : 0 });
                await db.SaveChangesAsync(ct);
                return;
            }
            catch (Exception e) when (attempt < 5 && e is DbUpdateException or System.Data.Common.DbException)
            {
                db.ChangeTracker.Clear();
                await Task.Delay(20 * attempt, ct);
            }
        }
    }

    /// <summary>The last <paramref name="days"/> days (today included), counts only.</summary>
    public async Task<UsageReportDto> ReportAsync(int days, CancellationToken ct)
    {
        days = Math.Clamp(days, 1, 365);
        var to = DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime);
        var from = to.AddDays(1 - days);

        var rows = await db.PageViews.AsNoTracking().Where(v => v.Date >= from && v.Date <= to)
            .Select(v => new { v.Date, v.Route, v.Views }).ToListAsync(ct);
        var top = rows.GroupBy(r => r.Route)
            .Select(g => new UsageRouteDto(g.Key, g.Sum(r => r.Views), g.Select(r => r.Date).Distinct().Count()))
            .OrderByDescending(r => r.Views).ThenBy(r => r.Route).ToList();
        var daily = Enumerable.Range(0, days).Select(i => from.AddDays(i))
            .Select(d => new UsageDayDto(d, rows.Where(r => r.Date == d).Sum(r => r.Views))).ToList();

        // Library: learners with at least one ticked step, and learners who finished at least one project.
        var stepsPerProject = await db.GuidedProjectSteps.AsNoTracking().GroupBy(s => s.ProjectId)
            .Select(g => new { ProjectId = g.Key, Steps = g.Count() }).ToDictionaryAsync(x => x.ProjectId, x => x.Steps, ct);
        var progress = await db.GuidedStepProgress.IgnoreQueryFilters().AsNoTracking()
            .GroupBy(p => new { p.UserId, p.Step.ProjectId })
            .Select(g => new { g.Key.UserId, g.Key.ProjectId, Done = g.Count() }).ToListAsync(ct);
        var finished = progress.Where(p => p.Done >= stepsPerProject.GetValueOrDefault(p.ProjectId, int.MaxValue)).ToList();

        var sources = (await db.SourceVisits.AsNoTracking().Where(v => v.Date >= from && v.Date <= to)
                .Select(v => new { v.Source, v.Visits, v.SignUps }).ToListAsync(ct))
            .GroupBy(v => v.Source)
            .Select(g => new UsageSourceDto(g.Key, g.Sum(v => v.Visits), g.Sum(v => v.SignUps)))
            .OrderByDescending(v => v.SignUps).ThenByDescending(v => v.Visits).ThenBy(v => v.Source).ToList();

        // Roadmaps: accounts per chosen roadmap (all accounts, so the per-user filter is lifted), and those not chosen yet.
        var chosen = await db.UserTracks.IgnoreQueryFilters().AsNoTracking()
            .GroupBy(u => u.TrackSlug).Select(g => new { g.Key, Count = g.Count() }).ToDictionaryAsync(g => g.Key, g => g.Count, ct);
        var accounts = await db.Users.CountAsync(ct);
        var roadmaps = (await db.Tracks.AsNoTracking().OrderBy(t => t.Order).Select(t => new { t.Slug, t.TitleEn, t.TitleAr }).ToListAsync(ct))
            .Select(t => new UsageRoadmapDto(t.Slug, t.TitleEn, t.TitleAr, chosen.GetValueOrDefault(t.Slug)))
            .Append(new UsageRoadmapDto("", "", "", Math.Max(0, accounts - chosen.Values.Sum())))
            .ToList();

        return new UsageReportDto(from, to, rows.Sum(r => r.Views), top, daily,
            new UsageLibraryDto(
                progress.Select(p => p.UserId).Distinct().Count(),
                finished.Select(p => p.UserId).Distinct().Count(),
                finished.Count),
            sources, roadmaps);
    }
}
