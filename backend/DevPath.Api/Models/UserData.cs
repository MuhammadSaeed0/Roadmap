namespace DevPath.Api.Models;

// ---------------------------------------------------------------------------
// User-owned data. The seeder never writes to these tables, so updating or
// re-running the seed can't wipe out your progress, notes or study history.
// The application is single-user, so progress rows are keyed by the content Id.
// ---------------------------------------------------------------------------

public class TopicProgress
{
    /// <summary>Primary key AND foreign key: one progress row per topic.</summary>
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

public class StudySession
{
    public int Id { get; set; }
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

public class Note
{
    public int Id { get; set; }
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

public class ProjectTaskProgress
{
    public int ProjectTaskId { get; set; }
    public ProjectTask ProjectTask { get; set; } = null!;
    public ProjectTaskStatus Status { get; set; }
    public string? BlockedReason { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class PortfolioCheck
{
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public int ChecklistItemId { get; set; }
    public PortfolioChecklistItem ChecklistItem { get; set; } = null!;
    public bool IsDone { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class PracticeProgress
{
    public int ExerciseId { get; set; }
    public PracticeExercise Exercise { get; set; } = null!;
    public PracticeStatus Status { get; set; }
    /// <summary>The learner's own explanation, written before revealing the solution.</summary>
    public string? UserAnswer { get; set; }
    public int HintsRevealed { get; set; }
    public bool SolutionRevealed { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class InterviewProgress
{
    public int QuestionId { get; set; }
    public InterviewQuestion Question { get; set; } = null!;
    public InterviewRating Rating { get; set; }
    public int TimesPracticed { get; set; }
    public DateTime LastPracticedAt { get; set; }
}

/// <summary>
/// Spaced review entry. References the canonical topic — never a copy of it.
/// </summary>
public class ReviewSchedule
{
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    public int IntervalDays { get; set; }
    public DateOnly NextReviewOn { get; set; }
    public DateOnly? LastReviewedOn { get; set; }
    public int ReviewCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>Single-row table (Id = 1) with learning preferences that affect recommendations.</summary>
public class LearningPreference
{
    public int Id { get; set; }
    public int DailyGoalMinutes { get; set; } = 60;
    /// <summary>When true, recommendations may include topics whose prerequisites are incomplete.</summary>
    public bool AllowSkippingPrerequisites { get; set; }
    /// <summary>Optional skill to prioritise in recommendations.</summary>
    public SkillArea? FocusSkill { get; set; }
    /// <summary>First day of the week for weekly reviews and charts.</summary>
    public DayOfWeek WeekStartsOn { get; set; } = DayOfWeek.Monday;
    public DateTime UpdatedAt { get; set; }
}
