using System.ComponentModel.DataAnnotations;

namespace DevPath.Api.DTOs;

// ---------- Discussions ----------

public record DiscussionSummaryDto(
    int Id, int TopicId, string TopicTitleEn, string TopicTitleAr,
    string Title, string Body,
    string? AuthorName, int Score, bool IsPinned, bool HasAcceptedReply,
    int ReplyCount, DateTime CreatedAt, int? MyVote,
    GuidedRefDto? Guided = null);

/// <summary>The Project library project (and step) a discussion is about.</summary>
public record GuidedRefDto(int Id, string TitleEn, string TitleAr, int? StepOrder);

public record DiscussionDetailDto(
    int Id, int TopicId, string TopicTitleEn, string TopicTitleAr,
    string Title, string Body,
    string? AuthorId, string? AuthorName, int Score, bool IsPinned,
    int? AcceptedReplyId, DateTime CreatedAt, DateTime UpdatedAt,
    int? MyVote, IReadOnlyList<ReplyDto> Replies,
    GuidedRefDto? Guided = null);

public record ReplyDto(
    int Id, int DiscussionId, string? AuthorId, string? AuthorName,
    string Body, int Score, bool IsAccepted,
    DateTime CreatedAt, DateTime UpdatedAt, int? MyVote);

public record CreateDiscussionRequest(
    [Required] int? TopicId,
    [Required, MaxLength(200)] string Title,
    [Required, MaxLength(4000)] string Body,
    int? GuidedProjectId = null, [Range(1, 200)] int? GuidedStepOrder = null);

public record UpdateDiscussionRequest(
    [Required, MaxLength(200)] string Title,
    [Required, MaxLength(4000)] string Body);

public record CreateReplyRequest(
    [Required, MaxLength(4000)] string Body);

public record VoteRequest([Required] short? Value);

public record AcceptReplyRequest([Required] int? ReplyId);

// ---------- Notifications ----------

public record NotificationDto(
    long Id, string Kind, int? DiscussionId, int? ProjectId,
    string? ActorName, string MessageEn, string MessageAr,
    bool IsRead, DateTime CreatedAt, int? GuidedProjectId = null);

public record MarkReadRequest(long[] Ids);

public record UnreadCountDto(int Count);
