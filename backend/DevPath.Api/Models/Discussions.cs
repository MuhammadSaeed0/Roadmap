namespace DevPath.Api.Models;

// ---------------------------------------------------------------------------
// Community discussions. Discussions and replies are visible to everyone (NOT
// IUserOwned). Votes are per-user. Notifications are cross-user, filtered by
// RecipientId in controller queries rather than by the global query filter.
// ---------------------------------------------------------------------------

public class Discussion
{
    public int Id { get; set; }
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    public string? AuthorId { get; set; }
    public AppUser? Author { get; set; }

    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }
    public required string BodyEn { get; set; }
    public required string BodyAr { get; set; }

    public int Score { get; set; }
    public bool IsPinned { get; set; }
    public int? AcceptedReplyId { get; set; }
    public DiscussionReply? AcceptedReply { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<DiscussionReply> Replies { get; set; } = [];
}

public class DiscussionReply
{
    public int Id { get; set; }
    public int DiscussionId { get; set; }
    public Discussion Discussion { get; set; } = null!;
    public string? AuthorId { get; set; }
    public AppUser? Author { get; set; }

    public required string BodyEn { get; set; }
    public required string BodyAr { get; set; }
    public int Score { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class DiscussionVote : IUserOwned
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public int? DiscussionId { get; set; }
    public int? ReplyId { get; set; }
    public short Value { get; set; }
}

public enum NotificationKind
{
    ReplyToDiscussion,
    AnswerAccepted,
    VoteMilestone
}

public class Notification
{
    public long Id { get; set; }
    public required string RecipientId { get; set; }
    public AppUser Recipient { get; set; } = null!;
    public NotificationKind Kind { get; set; }
    public int? DiscussionId { get; set; }
    public Discussion? Discussion { get; set; }
    public string? ActorId { get; set; }
    public AppUser? Actor { get; set; }

    public required string MessageEn { get; set; }
    public required string MessageAr { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}
