namespace DevPath.Api.Models;

// All enums are stored as strings (see AppDbContext.ConfigureConventions) so the
// database stays readable when you query it directly from SSMS or sqlcmd.

/// <summary>The technology area a topic belongs to. Used for per-skill progress.</summary>
public enum SkillArea
{
    CSharp,
    AspNetCore,
    EfCore,
    SqlServer,
    TypeScript,
    Angular,
    FullStack,
    Testing,
    Git,
    Professional
}

public enum TopicPriority
{
    Core,
    Important,
    Optional
}

public enum TopicStatus
{
    NotStarted,
    InProgress,
    Completed,
    /// <summary>Skipped because the learner already knows it.</summary>
    Skipped
}

/// <summary>Self-assessment of prior knowledge — mainly useful for SQL Server topics.</summary>
public enum KnowledgeLevel
{
    Unassessed,
    AlreadyKnow,
    NeedReview,
    NeedToLearn
}

public enum ProjectTaskStatus
{
    NotStarted,
    InProgress,
    Completed,
    Blocked
}

public enum ResourceType
{
    Documentation,
    Tutorial,
    Course,
    Video,
    Article,
    Reference,
    Tool
}

public enum Difficulty
{
    Beginner,
    Intermediate,
    Advanced
}

public enum VerificationStatus
{
    Unverified,
    Verified,
    Broken
}

public enum ExerciseType
{
    Coding,
    Debugging,
    Scenario,
    CodeReview
}

public enum PracticeStatus
{
    NotStarted,
    Attempted,
    Completed
}

public enum InterviewCategory
{
    CSharp,
    DotNet,
    AspNetCore,
    EfCore,
    SqlServer,
    TypeScript,
    Angular,
    RestApi,
    Testing,
    Git,
    FullStackDesign
}

public enum InterviewRating
{
    NeedReview,
    Partial,
    Confident
}
