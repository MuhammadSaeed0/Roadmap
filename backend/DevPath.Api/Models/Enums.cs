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
    Advanced,
    /// <summary>Practice Lab only: open-ended problems that need research and design decisions.</summary>
    Expert
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
    CodeReview,
    /// <summary>Explain, compare or choose between concepts in your own words.</summary>
    Conceptual,
    /// <summary>A realistic development task: CRUD, validation, authentication, pagination ...</summary>
    Practical,
    /// <summary>A small project that combines several concepts of one technology.</summary>
    MiniProject,
    /// <summary>An integrated challenge that combines several technologies of the roadmap.</summary>
    FullStack,
    /// <summary>An advanced, open-ended problem.</summary>
    Challenge
}

/// <summary>Where an exercise's code can run. Everything runs in the learner's browser, never on the server.</summary>
public enum ExerciseRunner
{
    /// <summary>No code runner: written answer, design or a project you build in your own environment.</summary>
    None,
    CSharp,
    Sql,
    JavaScript,
    TypeScript,
    /// <summary>HTML, CSS and JavaScript with a live preview.</summary>
    Web,
    /// <summary>A multi-file Angular app with a live preview.</summary>
    Angular
}

/// <summary>The kinds of Code Playground workspace.</summary>
public enum WorkspaceKind
{
    CSharp,
    Sql,
    JavaScript,
    TypeScript,
    Web,
    Angular
}

public enum VideoLanguage
{
    English,
    Arabic
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
    FullStackDesign,
    // Classic interview topics (the chapters of a typical coding-interview book).
    DataStructures,
    Algorithms,
    ObjectOrientedDesign,
    SystemDesign,
    Concurrency,
    Behavioral
}

public enum InterviewRating
{
    NeedReview,
    Partial,
    Confident
}
