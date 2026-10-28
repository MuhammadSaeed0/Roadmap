using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Learning preferences that affect recommendations (theme/language live in the browser).
/// One row per account; the query filter means the table holds only the signed-in user's row.
/// </summary>
public class PreferenceService(AppDbContext db, TimeProvider clock)
{
    public async Task<LearningPreference> GetEntityAsync(CancellationToken ct) =>
        await db.LearningPreferences.AsNoTracking().SingleOrDefaultAsync(ct)
        ?? new LearningPreference();

    public async Task<PreferencesDto> GetAsync(CancellationToken ct) => ToDto(await GetEntityAsync(ct));

    public async Task<PreferencesDto> UpdateAsync(UpdatePreferencesRequest r, CancellationToken ct)
    {
        var pref = await db.LearningPreferences.SingleOrDefaultAsync(ct);
        if (pref is null)
        {
            pref = new LearningPreference();
            db.LearningPreferences.Add(pref);
        }
        pref.DailyGoalMinutes = r.DailyGoalMinutes!.Value;
        pref.AllowSkippingPrerequisites = r.AllowSkippingPrerequisites!.Value;
        pref.FocusSkill = r.FocusSkill;
        pref.WeekStartsOn = r.WeekStartsOn!.Value;
        pref.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return ToDto(pref);
    }

    private static PreferencesDto ToDto(LearningPreference p) =>
        new(p.DailyGoalMinutes, p.AllowSkippingPrerequisites, p.FocusSkill, p.WeekStartsOn);

    /// <summary>The first day of the week containing <paramref name="date"/>.</summary>
    public static DateOnly WeekStart(DateOnly date, DayOfWeek startsOn)
    {
        var diff = ((int)date.DayOfWeek - (int)startsOn + 7) % 7;
        return date.AddDays(-diff);
    }
}
