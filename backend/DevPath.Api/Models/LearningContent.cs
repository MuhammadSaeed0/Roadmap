namespace DevPath.Api.Models;

// ---------------------------------------------------------------------------
// Canonical learning content. These rows are created and updated by DbSeeder
// from the JSON files in Data/Seed. Each one has a stable "Slug" or "Key" so the
// seeder can upsert it without ever creating duplicates.
//
// Bilingual strategy: every translatable field has an En and an Ar column on the
// SAME row. There is never a separate Arabic topic — both languages share one Id.
// ---------------------------------------------------------------------------

public class Phase
{
    public int Id { get; set; }
    public required string Slug { get; set; }
    public int Order { get; set; }
    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }
    public string DescriptionEn { get; set; } = "";
    public string DescriptionAr { get; set; } = "";

    public List<Topic> Topics { get; set; } = [];
}

public class Topic
{
    public int Id { get; set; }
    public required string Slug { get; set; }
    public int PhaseId { get; set; }
    public Phase Phase { get; set; } = null!;
    public int Order { get; set; }

    public SkillArea Skill { get; set; }
    public TopicPriority Priority { get; set; }
    public int EstimatedMinutes { get; set; }

    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }

    /// <summary>What is it?</summary>
    public string SummaryEn { get; set; } = "";
    public string SummaryAr { get; set; } = "";
    /// <summary>Why does it matter?</summary>
    public string WhyEn { get; set; } = "";
    public string WhyAr { get; set; } = "";
    /// <summary>How does it work?</summary>
    public string HowEn { get; set; } = "";
    public string HowAr { get; set; } = "";
    /// <summary>Real-world example.</summary>
    public string ExampleEn { get; set; } = "";
    public string ExampleAr { get; set; } = "";

    /// <summary>Code is language-neutral, so it is stored once.</summary>
    public string? CodeSample { get; set; }
    public string? CodeLanguage { get; set; }

    public string PracticeTaskEn { get; set; } = "";
    public string PracticeTaskAr { get; set; } = "";
    public string ChallengeEn { get; set; } = "";
    public string ChallengeAr { get; set; } = "";

    public List<TopicPrerequisite> Prerequisites { get; set; } = [];
    public List<TopicPrerequisite> RequiredBy { get; set; } = [];
    public List<ResourceTopic> ResourceLinks { get; set; } = [];
    public List<ProjectTaskTopic> ProjectTaskLinks { get; set; } = [];
    // Per-user rows. AppDbContext's query filter limits them to the signed-in user,
    // so each holds at most one row (or none) whenever it is queried.
    public List<TopicProgress> ProgressRows { get; set; } = [];
    public List<ReviewSchedule> ReviewRows { get; set; } = [];
}

/// <summary>Explicit many-to-many: Topic requires PrerequisiteTopic.</summary>
public class TopicPrerequisite
{
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    public int PrerequisiteTopicId { get; set; }
    public Topic PrerequisiteTopic { get; set; } = null!;
}

public class Resource
{
    public int Id { get; set; }
    public required string Key { get; set; }
    public required string TitleEn { get; set; }
    public string? TitleAr { get; set; }
    public required string Url { get; set; }
    public required string SourceName { get; set; }
    public ResourceType Type { get; set; }
    public Difficulty Difficulty { get; set; }
    public bool IsFree { get; set; } = true;

    // Verification is written by the link checker, never assumed by the seeder.
    public VerificationStatus VerificationStatus { get; set; }
    public DateTime? LastVerifiedAt { get; set; }
    public int? LastStatusCode { get; set; }

    public List<ResourceTopic> TopicLinks { get; set; } = [];
}

public class ResourceTopic
{
    public int ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
}

public class PracticeExercise
{
    public int Id { get; set; }
    public required string Key { get; set; }
    public ExerciseType Type { get; set; }
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    public Difficulty Difficulty { get; set; }
    public int EstimatedMinutes { get; set; }

    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }
    public string ProblemEn { get; set; } = "";
    public string ProblemAr { get; set; } = "";
    /// <summary>Starting code: buggy code, code to review, or a starter snippet.</summary>
    public string? Code { get; set; }
    public string? CodeLanguage { get; set; }
    public string ExpectedOutcomeEn { get; set; } = "";
    public string ExpectedOutcomeAr { get; set; } = "";
    /// <summary>Hints separated by new lines; revealed one at a time.</summary>
    public string HintsEn { get; set; } = "";
    public string HintsAr { get; set; } = "";
    public string SolutionEn { get; set; } = "";
    public string SolutionAr { get; set; } = "";
    public string? SolutionCode { get; set; }

    /// <summary>Per-user rows, filtered to the signed-in user (at most one).</summary>
    public List<PracticeProgress> ProgressRows { get; set; } = [];
}

public class InterviewQuestion
{
    public int Id { get; set; }
    public required string Key { get; set; }
    public InterviewCategory Category { get; set; }
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    public Difficulty Difficulty { get; set; }

    public required string QuestionEn { get; set; }
    public required string QuestionAr { get; set; }
    public string AnswerEn { get; set; } = "";
    public string AnswerAr { get; set; } = "";
    public string? ExampleCode { get; set; }
    public string? FollowUpEn { get; set; }
    public string? FollowUpAr { get; set; }

    /// <summary>Per-user rows, filtered to the signed-in user (at most one).</summary>
    public List<InterviewProgress> ProgressRows { get; set; } = [];
}
