using System.ComponentModel.DataAnnotations;

namespace DevPath.Api.DTOs;

// ---------- Discussions ----------

public record DiscussionSummaryDto(
    int Id, int TopicId, string TopicTitleEn, string TopicTitleAr,
    string TitleEn, string TitleAr, string BodyEn, string BodyAr,
    string? AuthorName, int Score, bool IsPinned, bool HasAcceptedReply,
    int ReplyCount, DateTime CreatedAt, int? MyVote);

public record DiscussionDetailDto(
    int Id, int TopicId, string TopicTitleEn, string TopicTitleAr,
    string TitleEn, string TitleAr, string BodyEn, string BodyAr,
    string? AuthorId, string? AuthorName, int Score, bool IsPinned,
    int? AcceptedReplyId, DateTime CreatedAt, DateTime UpdatedAt,
    int? MyVote, IReadOnlyList<ReplyDto> Replies);

public record ReplyDto(
    int Id, int DiscussionId, string? AuthorId, string? AuthorName,
    string BodyEn, string BodyAr, int Score, bool IsAccepted,
    DateTime CreatedAt, DateTime UpdatedAt, int? MyVote);

public record CreateDiscussionRequest(
    [Required] int? TopicId,
    [Required, MaxLength(200)] string TitleEn,
    [Required, MaxLength(200)] string TitleAr,
    [Required, MaxLength(4000)] string BodyEn,
    [Required, MaxLength(4000)] string BodyAr);

public record UpdateDiscussionRequest(
    [Required, MaxLength(200)] string TitleEn,
    [Required, MaxLength(200)] string TitleAr,
    [Required, MaxLength(4000)] string BodyEn,
    [Required, MaxLength(4000)] string BodyAr);

public record CreateReplyRequest(
    [Required, MaxLength(4000)] string BodyEn,
    [Required, MaxLength(4000)] string BodyAr);

public record VoteRequest([Required] short? Value);

public record AcceptReplyRequest([Required] int? ReplyId);

// ---------- Notifications ----------

public record NotificationDto(
    long Id, string Kind, int? DiscussionId,
    string? ActorName, string MessageEn, string MessageAr,
    bool IsRead, DateTime CreatedAt);

public record MarkReadRequest(long[] Ids);

public record UnreadCountDto(int Count);
