using DevPath.Api.Services;

namespace DevPath.Api.Tests;

public class ReviewRulesTests
{
    [Theory]
    [InlineData(null, 1)]
    [InlineData(0, 1)]
    [InlineData(1, 1)]
    [InlineData(2, 2)]
    [InlineData(3, 4)]
    [InlineData(4, 8)]
    [InlineData(5, 16)]
    public void Interval_grows_with_confidence(int? confidence, int expectedDays) =>
        Assert.Equal(expectedDays, ReviewRules.IntervalDays(confidence));

    [Fact]
    public void Out_of_range_confidence_is_clamped() =>
        Assert.Equal(16, ReviewRules.IntervalDays(9));

    [Theory]
    [InlineData("2026-10-19", DayOfWeek.Monday, "2026-10-19")]   // Monday itself
    [InlineData("2026-10-22", DayOfWeek.Monday, "2026-10-19")]   // Thursday → previous Monday
    [InlineData("2026-10-22", DayOfWeek.Saturday, "2026-10-17")] // Saturday-based week
    [InlineData("2026-10-18", DayOfWeek.Monday, "2026-10-12")]   // Sunday belongs to the previous Monday week
    public void Week_start_respects_preference(string date, DayOfWeek startsOn, string expected) =>
        Assert.Equal(DateOnly.Parse(expected), PreferenceService.WeekStart(DateOnly.Parse(date), startsOn));

    [Fact]
    public void Streak_counts_consecutive_days_ending_today_or_yesterday()
    {
        var today = new DateOnly(2026, 10, 19);
        var days = new HashSet<DateOnly> { today.AddDays(-1), today.AddDays(-2), today.AddDays(-4) };
        Assert.Equal(2, DashboardService.Streak(days, today));
    }
}
