namespace DevPath.Api.Models;

public enum ReviewRequestStatus { Open, Claimed, Completed, Cancelled }

/// <summary>
/// A learner asks another learner to review a finished project against the rubric. Not user-owned: the requester
/// and the reviewer both see it, so access is checked in the service. A completed review replaces the requester's
/// self-review for points and counts as <see cref="VerificationTier.Reviewed"/>.
/// </summary>
public class ProjectReviewRequest
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public required string RequesterId { get; set; }
    public AppUser Requester { get; set; } = null!;
    /// <summary>The repository link when the request was made, so later edits don't change what was reviewed.</summary>
    public required string RepositoryUrl { get; set; }

    public ReviewRequestStatus Status { get; set; }
    /// <summary>Set when claimed. No cascade (one path from accounts already cascades here); cleared in code when that account is deleted.</summary>
    public string? ReviewerId { get; set; }
    public AppUser? Reviewer { get; set; }

    /// <summary>JSON object: criterion key → score 0..4. Set when the review is submitted.</summary>
    public string? Scores { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? ClaimedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
