namespace DevPath.Api.Models;

// ---------------------------------------------------------------------------
// Developer level and skill assessment. Points are never typed in by hand: they are
// derived from the progress the learner already records (topics, quizzes, videos,
// exercises, project tasks) and written to an append-only ledger. See
// Services/Skills/SkillCalculator.cs for the rules and SeedData/skill-assessment.json
// for the numbers.
// ---------------------------------------------------------------------------

/// <summary>How a piece of evidence was confirmed. Self-reported evidence earns fewer points.</summary>
public enum VerificationTier
{
    /// <summary>The learner ticked a box. Nothing else confirms it.</summary>
    SelfReported,
    /// <summary>The learner left something that can be inspected: a repository link, a written answer, ticked acceptance criteria.</summary>
    Evidenced,
    /// <summary>The learner's browser ran the exercise's automatic checks and reported that all passed.</summary>
    AutoChecked,
    /// <summary>The server graded a quiz on it.</summary>
    QuizVerified,
    /// <summary>Someone other than the learner reviewed it. Reserved: no reviewer workflow exists yet.</summary>
    Reviewed
}

/// <summary>The kind of evidence, used for the evidence weights (passive 5%, knowledge 20% ...).</summary>
public enum EvidenceKind
{
    Passive,
    Knowledge,
    Practical,
    Project,
    Quality
}

public enum XpActivity
{
    VideoWatched,
    TopicCompleted,
    QuizQuestion,
    QuizLevelPassed,
    InterviewQuestion,
    ExerciseCompleted,
    ExerciseQuality,
    ProjectTaskCompleted,
    ProjectCompleted,
    ProjectReview,
    PortfolioItem
}

/// <summary>
/// One change to the learner's points. The ledger is append-only: when the evidence behind an award
/// changes (a task is re-opened, a better quiz score arrives), a new row records the difference, so the
/// sum of a source's rows is always what that source is worth now and nothing is ever counted twice.
/// </summary>
public class XpTransaction : IUserOwned
{
    public long Id { get; set; }
    public string UserId { get; set; } = "";
    /// <summary>What earned the points, e.g. "topic:12", "quiz-q:345", "project:3". Unique per user with <see cref="Seq"/>.</summary>
    public required string SourceKey { get; set; }
    /// <summary>1 for the first row of a source, then 2, 3 ... A unique index on (UserId, SourceKey, Seq) makes concurrent writes collide instead of double-counting.</summary>
    public int Seq { get; set; }
    public XpActivity Activity { get; set; }
    public EvidenceKind Evidence { get; set; }
    public VerificationTier Verification { get; set; }
    /// <summary>Positive for an award or an increase, negative for a reversal or a decrease.</summary>
    public int Points { get; set; }
    /// <summary>The source's total after this row.</summary>
    public int Balance { get; set; }
    /// <summary>Competency categories the source counts towards, comma separated.</summary>
    public string Categories { get; set; } = "";
    /// <summary>When the evidence happened (e.g. the task's CompletedAt); null when unknown.</summary>
    public DateTime? OccurredAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>One answer inside a quiz attempt. Lets each question earn points once, and measures accuracy.</summary>
public class QuizAnswer : IUserOwned
{
    public long Id { get; set; }
    public string UserId { get; set; } = "";
    public int AttemptId { get; set; }
    public QuizAttempt Attempt { get; set; } = null!;
    /// <summary>
    /// No foreign key: the seeder deletes questions that leave the seed files, and the learner's answer
    /// history must not block that. Answers to a question that no longer exists are ignored.
    /// </summary>
    public int QuestionId { get; set; }
    public int Choice { get; set; }
    public bool IsCorrect { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>The learner's review of a finished project against the rubric (architecture, code quality, testing ...).</summary>
public class ProjectAssessment : IUserOwned
{
    public string UserId { get; set; } = "";
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    /// <summary>JSON object: criterion key → score 0..4.</summary>
    public string Scores { get; set; } = "{}";
    public string? Notes { get; set; }
    /// <summary>SelfReported for the learner's own review. Reviewed is reserved for an outside reviewer.</summary>
    public VerificationTier Verification { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>A change of developer level, kept so the dashboard can show when each level was reached.</summary>
public class LevelChange : IUserOwned
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public required string Level { get; set; }
    public required string PreviousLevel { get; set; }
    public int Xp { get; set; }
    public double Overall { get; set; }
    public DateTime ChangedAt { get; set; }
}
