using System.ComponentModel.DataAnnotations;
using DevPath.Api.Models;

namespace DevPath.Api.DTOs;

// DTOs are the API contract. They return both English and Arabic fields so the
// Angular app can switch language instantly without another request.

public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}

/// <summary>A short reference to a topic, used in lists and links.</summary>
public record TopicRefDto(int Id, string Slug, string TitleEn, string TitleAr, SkillArea Skill, TopicStatus Status);

public record TopicSummaryDto(
    int Id, string Slug, int PhaseId, int Order, SkillArea Skill, TopicPriority Priority,
    int EstimatedMinutes, string TitleEn, string TitleAr, string SummaryEn, string SummaryAr,
    TopicStatus Status, KnowledgeLevel Knowledge, int? Confidence, bool InReview, bool PrerequisitesMet);

public record PhaseRefDto(int Id, string Slug, int Order, string TitleEn, string TitleAr);

public record ProjectBriefDto(int Id, string Slug, string TitleEn, string TitleAr, string TechStack, double Percent);

public record PhaseDto(
    int Id, string Slug, int Order, string TitleEn, string TitleAr, string DescriptionEn, string DescriptionAr,
    int TopicCount, int DoneCount, double Percent, int RemainingMinutes,
    IReadOnlyList<TopicSummaryDto> Topics, IReadOnlyList<ProjectBriefDto> Projects);

public record RoadmapDto(IReadOnlyList<PhaseDto> Phases, int? CurrentPhaseId);

public record ResourceDto(
    int Id, string Key, string TitleEn, string? TitleAr, string Url, string SourceName,
    ResourceType Type, Difficulty Difficulty, bool IsFree, VerificationStatus VerificationStatus,
    DateTime? LastVerifiedAt, int? LastStatusCode, IReadOnlyList<TopicRefDto> Topics,
    /// <summary>The phase of the earliest roadmap topic the resource belongs to (null when it isn't linked to a topic).</summary>
    PhaseRefDto? Phase = null);

public record TopicProjectLinkDto(int ProjectId, string Slug, string TitleEn, string TitleAr, int TaskCount);

public record InterviewRefDto(int Id, string QuestionEn, string QuestionAr, Difficulty Difficulty, InterviewRating? Rating);

public record ExerciseRefDto(int Id, ExerciseType Type, string TitleEn, string TitleAr, Difficulty Difficulty, PracticeStatus Status);

public record StudySessionDto(
    int Id, int? TopicId, string? TopicTitleEn, string? TopicTitleAr,
    int? ProjectTaskId, string? TaskTitleEn, string? TaskTitleAr,
    int? PlannedMinutes, int ActualMinutes, DateOnly SessionDate, string? Note, DateTime CreatedAt);

public record ReviewStateDto(int IntervalDays, DateOnly NextReviewOn, DateOnly? LastReviewedOn, int ReviewCount, bool IsDue);

public record TopicDetailDto(
    int Id, string Slug, PhaseRefDto Phase, int Order, SkillArea Skill, TopicPriority Priority, int EstimatedMinutes,
    string TitleEn, string TitleAr, string SummaryEn, string SummaryAr, string WhyEn, string WhyAr,
    string HowEn, string HowAr, string ExampleEn, string ExampleAr,
    string? CodeSample, string? CodeLanguage,
    string PracticeTaskEn, string PracticeTaskAr, string ChallengeEn, string ChallengeAr,
    TopicStatus Status, KnowledgeLevel Knowledge, int? Confidence, DateTime? CompletedAt,
    bool PrerequisitesMet,
    IReadOnlyList<TopicRefDto> Prerequisites, IReadOnlyList<TopicRefDto> Unlocks, IReadOnlyList<TopicRefDto> SamePhase,
    IReadOnlyList<ResourceDto> Resources, IReadOnlyList<TopicProjectLinkDto> Projects,
    IReadOnlyList<InterviewRefDto> InterviewQuestions, IReadOnlyList<ExerciseRefDto> Exercises,
    IReadOnlyList<StudySessionDto> Sessions, int TotalMinutesStudied, int NoteCount, ReviewStateDto? Review);

public record UpdateTopicProgressRequest(
    [Required] TopicStatus? Status,
    [Required] KnowledgeLevel? Knowledge,
    [Range(0, 5)] int? Confidence);

public record TopicProgressDto(int TopicId, TopicStatus Status, KnowledgeLevel Knowledge, int? Confidence,
    DateTime? StartedAt, DateTime? CompletedAt, DateTime UpdatedAt);

public record CreateStudySessionRequest(
    int? TopicId,
    int? ProjectTaskId,
    [Range(1, 1440)] int? PlannedMinutes,
    [Required, Range(1, 1440)] int? ActualMinutes,
    [Required] DateOnly? SessionDate,
    [MaxLength(1000)] string? Note);

// ---------- Recommendations & plans ----------

/// <summary>A reason code (translated by the UI) with optional parameters.</summary>
public record ReasonDto(string Code, IReadOnlyDictionary<string, string>? Params = null);

public record RecommendationDto(TopicSummaryDto Topic, PhaseRefDto Phase, double Score, IReadOnlyList<ReasonDto> Reasons);

public record StudyPlanItemDto(
    string Kind, int Minutes, string TitleEn, string TitleAr,
    int? TopicId = null, int? ExerciseId = null, int? ProjectId = null, int? ProjectTaskId = null,
    InterviewCategory? InterviewCategory = null);

public record StudyPlanDto(int Minutes, IReadOnlyList<StudyPlanItemDto> Items);

// ---------- Reviews ----------

public record ReviewItemDto(
    int TopicId, string Slug, string TitleEn, string TitleAr, SkillArea Skill, int? Confidence,
    int IntervalDays, DateOnly NextReviewOn, DateOnly? LastReviewedOn, int ReviewCount, int DaysOverdue);

public record ReviewRuleDto(int Confidence, int Days);

public record ReviewQueueDto(
    IReadOnlyList<ReviewItemDto> Due, IReadOnlyList<ReviewItemDto> Upcoming,
    IReadOnlyList<TopicRefDto> Suggested, IReadOnlyList<ReviewRuleDto> Rules);

public record CompleteReviewRequest([Required, Range(0, 5)] int? Confidence);

// ---------- Preferences ----------

public record PreferencesDto(int DailyGoalMinutes, bool AllowSkippingPrerequisites, SkillArea? FocusSkill, DayOfWeek WeekStartsOn);

public record UpdatePreferencesRequest(
    [Required, Range(10, 600)] int? DailyGoalMinutes,
    [Required] bool? AllowSkippingPrerequisites,
    SkillArea? FocusSkill,
    [Required] DayOfWeek? WeekStartsOn);
