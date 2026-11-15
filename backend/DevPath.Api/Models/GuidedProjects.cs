namespace DevPath.Api.Models;

/// <summary>
/// A guided project in the Project library: a small to large app the learner builds on their own, with
/// step-by-step instructions from an empty folder to a finished project, and hints for every step.
/// Seeded from SeedData/guided-projects (content, shared by everyone) and synchronised by key.
/// Unlike the four roadmap projects, these are optional practice and are not tied to a phase.
/// </summary>
public class GuidedProject
{
    public int Id { get; set; }
    public required string Key { get; set; }
    public SkillArea Skill { get; set; }
    /// <summary>Beginner, Intermediate or Advanced.</summary>
    public Difficulty Level { get; set; }
    public int Order { get; set; }
    public int EstimatedHours { get; set; }

    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }
    public string SummaryEn { get; set; } = "";
    public string SummaryAr { get; set; } = "";
    /// <summary>Technology names are not translated (e.g. "C# · .NET console").</summary>
    public string TechStack { get; set; } = "";
    /// <summary>Line-separated lists: what you will learn, what the app must do, how to know it is done, extra challenges.</summary>
    public string GoalsEn { get; set; } = "";
    public string GoalsAr { get; set; } = "";
    public string RequirementsEn { get; set; } = "";
    public string RequirementsAr { get; set; } = "";
    public string AcceptanceEn { get; set; } = "";
    public string AcceptanceAr { get; set; } = "";
    public string StretchEn { get; set; } = "";
    public string StretchAr { get; set; } = "";

    public List<GuidedProjectStep> Steps { get; set; } = [];
    /// <summary>Roadmap topics the project practises; its topic pages suggest it.</summary>
    public List<GuidedProjectTopic> TopicLinks { get; set; } = [];
}

/// <summary>One step of a guided project: what to do, an optional code sketch, and hints revealed one at a time.</summary>
public class GuidedProjectStep
{
    public int Id { get; set; }
    public required string Key { get; set; }
    public int ProjectId { get; set; }
    public GuidedProject Project { get; set; } = null!;
    public int Order { get; set; }

    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }
    /// <summary>Paragraphs separated by a blank line; a line starting with "- " is a list item; `code` is inline code.</summary>
    public string BodyEn { get; set; } = "";
    public string BodyAr { get; set; } = "";
    public string? Code { get; set; }
    public string? CodeLanguage { get; set; }
    /// <summary>Hints separated by new lines.</summary>
    public string HintsEn { get; set; } = "";
    public string HintsAr { get; set; } = "";

    /// <summary>Per-user rows, filtered to the signed-in user (at most one).</summary>
    public List<GuidedStepProgress> ProgressRows { get; set; } = [];
}

public class GuidedProjectTopic
{
    public int ProjectId { get; set; }
    public GuidedProject Project { get; set; } = null!;
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
}

/// <summary>The learner's repository for a library project they built.</summary>
public class GuidedProjectRepository : IUserOwned
{
    public string UserId { get; set; } = "";
    public int ProjectId { get; set; }
    public GuidedProject Project { get; set; } = null!;
    public required string Url { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>A step the learner marked as done.</summary>
public class GuidedStepProgress : IUserOwned
{
    public string UserId { get; set; } = "";
    public int StepId { get; set; }
    public GuidedProjectStep Step { get; set; } = null!;
    public DateTime CompletedAt { get; set; }
}
