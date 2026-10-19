namespace DevPath.Api.Models;

public enum TaskPriority
{
    High,
    Medium,
    Low
}

public class Project
{
    public int Id { get; set; }
    public required string Slug { get; set; }
    public int Order { get; set; }
    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }
    public string SummaryEn { get; set; } = "";
    public string SummaryAr { get; set; } = "";
    /// <summary>Requirements, one per line.</summary>
    public string RequirementsEn { get; set; } = "";
    public string RequirementsAr { get; set; } = "";
    /// <summary>Technology names are not translated (e.g. "C# · ASP.NET Core · EF Core").</summary>
    public required string TechStack { get; set; }

    /// <summary>The roadmap phase you should finish before starting this project.</summary>
    public int StartAfterPhaseId { get; set; }
    public Phase StartAfterPhase { get; set; } = null!;

    /// <summary>User-editable: link to the learner's own repository.</summary>
    public string? RepositoryUrl { get; set; }

    public List<ProjectMilestone> Milestones { get; set; } = [];
    public List<PortfolioCheck> PortfolioChecks { get; set; } = [];
}

public class ProjectMilestone
{
    public int Id { get; set; }
    public required string Key { get; set; }
    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public int Order { get; set; }
    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }
    public string DescriptionEn { get; set; } = "";
    public string DescriptionAr { get; set; } = "";

    public List<ProjectTask> Tasks { get; set; } = [];
}

public class ProjectTask
{
    public int Id { get; set; }
    public required string Key { get; set; }
    public int MilestoneId { get; set; }
    public ProjectMilestone Milestone { get; set; } = null!;
    public int Order { get; set; }

    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }
    public string DescriptionEn { get; set; } = "";
    public string DescriptionAr { get; set; } = "";
    /// <summary>Acceptance criteria, one per line.</summary>
    public string AcceptanceCriteriaEn { get; set; } = "";
    public string AcceptanceCriteriaAr { get; set; } = "";
    public int EstimatedMinutes { get; set; }
    public TaskPriority Priority { get; set; }

    /// <summary>
    /// Change requests simulate a stakeholder asking for a modification to code you
    /// already wrote. They unlock once the project reaches UnlockAtPercent and are
    /// optional: they don't count towards project completion.
    /// </summary>
    public bool IsChangeRequest { get; set; }
    public int UnlockAtPercent { get; set; }

    public List<ProjectTaskTopic> TopicLinks { get; set; } = [];
    public ProjectTaskProgress? Progress { get; set; }
}

public class ProjectTaskTopic
{
    public int ProjectTaskId { get; set; }
    public ProjectTask ProjectTask { get; set; } = null!;
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
}

/// <summary>Items every portfolio project should have (README, screenshots, ...).</summary>
public class PortfolioChecklistItem
{
    public int Id { get; set; }
    public required string Key { get; set; }
    public int Order { get; set; }
    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }
    public string DescriptionEn { get; set; } = "";
    public string DescriptionAr { get; set; } = "";
}
