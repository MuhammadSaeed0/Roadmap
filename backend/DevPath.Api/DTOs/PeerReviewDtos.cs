namespace DevPath.Api.DTOs;

/// <summary>A review request as one of its two parties (or an eligible reviewer) sees it. Never includes an email.</summary>
public record ReviewRequestDto(
    int Id, int ProjectId, string ProjectTitleEn, string ProjectTitleAr, string TechStack,
    string RequesterName, string RepositoryUrl, string Status, string? ReviewerName,
    bool IsMine, bool IsReviewer, IReadOnlyDictionary<string, int>? Scores, string? Notes,
    DateTime CreatedAt, DateTime? ClaimedAt, DateTime? CompletedAt);

public record ReviewRequestListsDto(
    IReadOnlyList<string> Criteria,
    IReadOnlyList<ReviewRequestDto> Open,
    IReadOnlyList<ReviewRequestDto> Requested,
    IReadOnlyList<ReviewRequestDto> Reviewing);

public record SubmitReviewRequest(Dictionary<string, int> Scores, string? Notes);
