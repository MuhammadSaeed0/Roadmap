namespace DevPath.Api.DTOs;

/// <summary>Sent by the app on each page change: the route pattern only (for example "topics/:id").</summary>
public record PageViewRequest(string? Route);

/// <summary>Usage counts for the admin page. Counts only, nothing per person.</summary>
public record UsageReportDto(
    DateOnly From, DateOnly To, int TotalViews, IReadOnlyList<UsageRouteDto> TopPages, IReadOnlyList<UsageDayDto> Daily,
    UsageLibraryDto Library);

/// <summary>Views of one route in the period, and on how many of its days it was opened.</summary>
public record UsageRouteDto(string Route, int Views, int Days);

public record UsageDayDto(DateOnly Date, int Views);

/// <summary>Learners who ticked at least one library step, who finished at least one project, and finished projects in all.</summary>
public record UsageLibraryDto(int LearnersStarted, int LearnersFinished, int ProjectsFinished);
