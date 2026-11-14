namespace DevPath.Api.Models;

// ---------------------------------------------------------------------------
// Learning paths. Built-in paths are shared (no owner); user-created paths
// are filtered by CreatorId in controller logic, not by the global query
// filter. UserLearningPath is IUserOwned: it tracks which paths a user
// activated.
// ---------------------------------------------------------------------------

public class LearningPath
{
    public int Id { get; set; }
    public string? CreatorId { get; set; }
    public AppUser? Creator { get; set; }

    public required string Slug { get; set; }
    public required string NameEn { get; set; }
    public required string NameAr { get; set; }
    public string DescriptionEn { get; set; } = "";
    public string DescriptionAr { get; set; } = "";
    public string IconName { get; set; } = "route";
    public bool IsBuiltIn { get; set; }
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<LearningPathPhase> Phases { get; set; } = [];
    public ICollection<LearningPathTopic> Topics { get; set; } = [];
}

public class LearningPathPhase
{
    public int Id { get; set; }
    public int LearningPathId { get; set; }
    public LearningPath LearningPath { get; set; } = null!;
    public int PhaseId { get; set; }
    public Phase Phase { get; set; } = null!;
    public int SortOrder { get; set; }
}

public class LearningPathTopic
{
    public int Id { get; set; }
    public int LearningPathId { get; set; }
    public LearningPath LearningPath { get; set; } = null!;
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    public int SortOrder { get; set; }
}

public class UserLearningPath : IUserOwned
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public int LearningPathId { get; set; }
    public LearningPath LearningPath { get; set; } = null!;
    public DateTime ActivatedAt { get; set; }
}
