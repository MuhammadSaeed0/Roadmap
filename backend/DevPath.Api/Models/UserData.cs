namespace DevPath.Api.Models;

// ---------------------------------------------------------------------------
// User-owned data. Every row belongs to one account (UserId). AppDbContext adds a
// query filter so a request only ever sees the signed-in user's rows, and fills in
// UserId when a row is added, so services never take a user id from the request.
// The seeder never writes to these tables, so re-seeding can't wipe anyone's data.
// ---------------------------------------------------------------------------

/// <summary>Marks an entity as private to one account. See AppDbContext for how it is enforced.</summary>
public interface IUserOwned
{
    string UserId { get; set; }
}

public class TopicProgress : IUserOwned
{
    /// <summary>Key: (UserId, TopicId). One progress row per user and topic.</summary>
    public string UserId { get; set; } = "";
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;

    public TopicStatus Status { get; set; }
    public KnowledgeLevel Knowledge { get; set; }
    /// <summary>0 = never seen it … 5 = can explain and debug it. Null = not rated yet.</summary>
    public int? Confidence { get; set; }

    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class StudySession : IUserOwned
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public int? TopicId { get; set; }
    public Topic? Topic { get; set; }
    public int? ProjectTaskId { get; set; }
    public ProjectTask? ProjectTask { get; set; }

    public int? PlannedMinutes { get; set; }
    public int ActualMinutes { get; set; }
    public DateOnly SessionDate { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class Note : IUserOwned
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public required string Title { get; set; }
    public string Content { get; set; } = "";

    // A note can be attached to at most ONE entity (enforced by a check constraint).
    // Real foreign keys instead of a generic "EntityType + EntityId" pair keep
    // referential integrity in the database.
    public int? TopicId { get; set; }
    public Topic? Topic { get; set; }
    public int? ProjectId { get; set; }
    public Project? Project { get; set; }
    public int? ProjectTaskId { get; set; }
    public ProjectTask? ProjectTask { get; set; }
    public int? InterviewQuestionId { get; set; }
    public InterviewQuestion? InterviewQuestion { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ProjectTaskProgress : IUserOwned
{
    public string UserId { get; set; } = "";
    public int ProjectTaskId { get; set; }
    public ProjectTask ProjectTask { get; set; } = null!;
    public ProjectTaskStatus Status { get; set; }
    public string? BlockedReason { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class PortfolioCheck : IUserOwned
{
    public string UserId { get; set; } = "";
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public int ChecklistItemId { get; set; }
    public PortfolioChecklistItem ChecklistItem { get; set; } = null!;
    public bool IsDone { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>Link to the learner's own repository for a project.</summary>
public class ProjectRepository : IUserOwned
{
    public string UserId { get; set; } = "";
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public required string RepositoryUrl { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class PracticeProgress : IUserOwned
{
    public string UserId { get; set; } = "";
    public int ExerciseId { get; set; }
    public PracticeExercise Exercise { get; set; } = null!;
    public PracticeStatus Status { get; set; }
    /// <summary>The learner's own explanation, written before revealing the solution.</summary>
    public string? UserAnswer { get; set; }
    public int HintsRevealed { get; set; }
    public bool SolutionRevealed { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    /// <summary>JSON array of { path, content }: the learner's latest code, saved as they type.</summary>
    public string? SavedFiles { get; set; }
    /// <summary>How many times the learner submitted the code to the automatic checks.</summary>
    public int Submissions { get; set; }
    /// <summary>Percentage of checks passed, as reported by the learner's browser (it runs the checks).</summary>
    public int? LastScore { get; set; }
    public int? BestScore { get; set; }
    public DateTime? LastSubmittedAt { get; set; }
    /// <summary>Acceptance criteria the learner ticked off, as comma-separated indexes.</summary>
    public string? CheckedCriteria { get; set; }
}

/// <summary>A saved Code Playground workspace: a set of files of one kind (C#, SQL, Angular ...).</summary>
public class PlaygroundProject : IUserOwned
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public required string Name { get; set; }
    public WorkspaceKind Kind { get; set; }
    /// <summary>The template it started from, for "reset".</summary>
    public string? Template { get; set; }
    /// <summary>JSON array of { path, content }.</summary>
    public required string Files { get; set; }
    public int FileCount { get; set; }
    public int SizeBytes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class InterviewProgress : IUserOwned
{
    public string UserId { get; set; } = "";
    public int QuestionId { get; set; }
    public InterviewQuestion Question { get; set; } = null!;
    public InterviewRating Rating { get; set; }
    public int TimesPracticed { get; set; }
    public DateTime LastPracticedAt { get; set; }
}

/// <summary>
/// Spaced review entry. References the canonical topic — never a copy of it.
/// </summary>
public class ReviewSchedule : IUserOwned
{
    public string UserId { get; set; } = "";
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    public int IntervalDays { get; set; }
    public DateOnly NextReviewOn { get; set; }
    public DateOnly? LastReviewedOn { get; set; }
    public int ReviewCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>One row per account with learning preferences that affect recommendations.</summary>
public class LearningPreference : IUserOwned
{
    /// <summary>Primary key: one preferences row per account.</summary>
    public string UserId { get; set; } = "";
    public int DailyGoalMinutes { get; set; } = 60;
    /// <summary>When true, recommendations may include topics whose prerequisites are incomplete.</summary>
    public bool AllowSkippingPrerequisites { get; set; }
    /// <summary>Optional skill to prioritise in recommendations.</summary>
    public SkillArea? FocusSkill { get; set; }
    /// <summary>First day of the week for weekly reviews and charts.</summary>
    public DayOfWeek WeekStartsOn { get; set; } = DayOfWeek.Monday;
    public DateTime UpdatedAt { get; set; }
}

/// <summary>A YouTube video the user added to a topic by pasting its link.</summary>
public class UserTopicVideo : IUserOwned
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    /// <summary>YouTube's 11-character video id (validated before saving).</summary>
    public required string VideoId { get; set; }
    public required string Title { get; set; }
    public string ChannelTitle { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

/// <summary>One submitted topic quiz. Levels unlock in order: the next one opens once a level is passed.</summary>
public class QuizAttempt : IUserOwned
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    /// <summary>1 = this topic, 2 = this topic with the topics before it, 3 = review of the phase so far.</summary>
    public int Level { get; set; }
    public int Score { get; set; }
    public int Total { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>The user's watched / saved flags for a video. Key: (UserId, VideoId).</summary>
public class VideoProgress : IUserOwned
{
    public string UserId { get; set; } = "";
    public required string VideoId { get; set; }
    /// <summary>The topic where the user set the flags (for listing saved videos per topic).</summary>
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    public bool IsWatched { get; set; }
    public bool IsBookmarked { get; set; }
    public DateTime UpdatedAt { get; set; }
}
