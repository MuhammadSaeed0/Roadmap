using System.ComponentModel.DataAnnotations;
using DevPath.Api.Models;

namespace DevPath.Api.DTOs;

// ---------- Projects ----------

public record ProjectSummaryDto(
    int Id, string Slug, int Order, string TitleEn, string TitleAr, string SummaryEn, string SummaryAr,
    string TechStack, PhaseRefDto StartAfterPhase,
    int TotalTasks, int CompletedTasks, int InProgressTasks, int BlockedTasks, double Percent,
    string Status, string? CurrentMilestoneEn, string? CurrentMilestoneAr,
    int ChangeRequestsUnlocked, int ChangeRequestsDone, int PortfolioDone, int PortfolioTotal);

public record ProjectTaskDto(
    int Id, string Key, int MilestoneId, int Order, string TitleEn, string TitleAr,
    string DescriptionEn, string DescriptionAr, IReadOnlyList<string> CriteriaEn, IReadOnlyList<string> CriteriaAr,
    int EstimatedMinutes, TaskPriority Priority, bool IsChangeRequest, int UnlockAtPercent, bool IsLocked,
    ProjectTaskStatus Status, string? BlockedReason, DateTime? CompletedAt, IReadOnlyList<TopicRefDto> Topics);

public record MilestoneDto(
    int Id, int Order, string TitleEn, string TitleAr, string DescriptionEn, string DescriptionAr,
    int TotalTasks, int CompletedTasks, IReadOnlyList<ProjectTaskDto> Tasks);

public record PortfolioItemDto(int Id, string Key, string TitleEn, string TitleAr, string DescriptionEn, string DescriptionAr, bool IsDone);

public record ProjectDetailDto(
    ProjectSummaryDto Summary, IReadOnlyList<string> RequirementsEn, IReadOnlyList<string> RequirementsAr,
    string? RepositoryUrl, IReadOnlyList<MilestoneDto> Milestones, IReadOnlyList<ProjectTaskDto> ChangeRequests,
    IReadOnlyList<PortfolioItemDto> Portfolio, int NoteCount);

public record UpdateProjectTaskProgressRequest(
    [Required] ProjectTaskStatus? Status,
    [MaxLength(500)] string? BlockedReason);

public record UpdatePortfolioCheckRequest([Required] bool? IsDone);

public record UpdateRepositoryRequest([MaxLength(500), Url] string? RepositoryUrl);

// ---------- Resources ----------

public record LinkCheckResultDto(int Checked, int Verified, int Broken, int Unreachable, DateTime CheckedAt);

// ---------- Practice ----------

public record ExerciseSummaryDto(
    int Id, string Key, ExerciseType Type, int TopicId, string TopicTitleEn, string TopicTitleAr,
    Difficulty Difficulty, int EstimatedMinutes, string TitleEn, string TitleAr, PracticeStatus Status);

/// <summary>
/// Hints and the solution are only included once revealed, so the API — not just the
/// UI — enforces the "attempt first, then reveal" workflow.
/// </summary>
public record ExerciseDetailDto(
    ExerciseSummaryDto Summary, string ProblemEn, string ProblemAr, string? Code, string? CodeLanguage,
    string ExpectedOutcomeEn, string ExpectedOutcomeAr, int HintCount,
    IReadOnlyList<string> RevealedHintsEn, IReadOnlyList<string> RevealedHintsAr,
    string? UserAnswer, bool SolutionRevealed, string? SolutionEn, string? SolutionAr, string? SolutionCode,
    DateTime? CompletedAt);

public record PracticeOverviewDto(IReadOnlyList<ExerciseSummaryDto> Exercises, IReadOnlyList<PracticeTypeStatsDto> Stats);

public record PracticeTypeStatsDto(ExerciseType Type, int Total, int Completed, int Attempted);

public record SaveAttemptRequest([Required, MinLength(1), MaxLength(10000)] string? Answer);

public record UpdatePracticeStatusRequest([Required] PracticeStatus? Status);

// ---------- Interviews ----------

public record InterviewQuestionDto(
    int Id, string Key, InterviewCategory Category, int TopicId, string TopicTitleEn, string TopicTitleAr,
    Difficulty Difficulty, string QuestionEn, string QuestionAr, string AnswerEn, string AnswerAr,
    string? ExampleCode, string? FollowUpEn, string? FollowUpAr,
    InterviewRating? Rating, int TimesPracticed, DateTime? LastPracticedAt);

public record InterviewCategoryStatsDto(InterviewCategory Category, int Total, int Confident, int Partial, int NeedReview);

public record InterviewListDto(IReadOnlyList<InterviewQuestionDto> Questions, IReadOnlyList<InterviewCategoryStatsDto> Categories);

public record RateInterviewRequest([Required] InterviewRating? Rating);

// ---------- Notes ----------

public record NoteDto(
    int Id, string Title, string Content, string? LinkType, int? LinkId, string? LinkTitleEn, string? LinkTitleAr,
    int? LinkParentId, DateTime CreatedAt, DateTime UpdatedAt);

public record NoteRequest(
    [Required, MinLength(1), MaxLength(200)] string? Title,
    [MaxLength(20000)] string? Content,
    int? TopicId, int? ProjectId, int? ProjectTaskId, int? InterviewQuestionId) : IValidatableObject
{
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var links = new[] { TopicId, ProjectId, ProjectTaskId, InterviewQuestionId }.Count(x => x.HasValue);
        if (links > 1)
            yield return new ValidationResult("A note can be linked to only one item.", [nameof(TopicId)]);
    }
}

// ---------- Dashboard / analytics ----------

public record OverallProgressDto(
    double Percent, int DoneTopics, int RemainingTopics, int TotalTopics, int RemainingMinutes, PhaseRefDto? CurrentPhase);

public record SkillProgressDto(SkillArea Skill, double Percent, int Done, int Total, double? AverageConfidence, double Weight);

public record ActivityDto(string Kind, string TitleEn, string TitleAr, DateTime At, int? EntityId, int? ParentId, int? Minutes);

public record DashboardDto(
    OverallProgressDto Overall, RecommendationDto? Recommendation, IReadOnlyList<ProjectSummaryDto> Projects,
    IReadOnlyList<SkillProgressDto> Skills, IReadOnlyList<ActivityDto> RecentActivity,
    int ReviewsDue, int MinutesThisWeek, int StreakDays, int DailyGoalMinutes, int MinutesToday);

public record PhaseProgressDto(int Id, int Order, string TitleEn, string TitleAr, double Percent, int Done, int Total);

public record WeekMinutesDto(DateOnly WeekStart, int Minutes);

public record WeakTopicDto(TopicRefDto Topic, int? Confidence, string Reason);

public record AchievementDto(string Code, IReadOnlyDictionary<string, string> Params, DateTime? At);

public record InterviewStatsDto(int Total, int Confident, int Partial, int NeedReview, int NotPracticed);

public record FormulaDto(IReadOnlyDictionary<SkillArea, double> SkillWeights, IReadOnlyDictionary<TopicPriority, double> PriorityWeights);

public record ConfidenceBucketDto(string Level, int Count);

public record ProgressReportDto(
    OverallProgressDto Overall, FormulaDto Formula, IReadOnlyList<SkillProgressDto> Skills,
    IReadOnlyList<PhaseProgressDto> Phases, IReadOnlyList<ConfidenceBucketDto> Confidence,
    IReadOnlyList<ProjectSummaryDto> Projects, IReadOnlyList<PracticeTypeStatsDto> Practice,
    InterviewStatsDto Interview, IReadOnlyList<WeekMinutesDto> WeeklyStudy,
    IReadOnlyList<AchievementDto> Achievements, IReadOnlyList<WeakTopicDto> WeakAreas, int TotalMinutesStudied);

public record TaskRefDto(int Id, int ProjectId, string TitleEn, string TitleAr, string ProjectTitleEn, string ProjectTitleAr);

public record WeeklyReviewDto(
    DateOnly WeekStart, DateOnly WeekEnd, IReadOnlyList<TopicRefDto> TopicsCompleted, int MinutesStudied,
    int PreviousWeekMinutes, int SessionCount, IReadOnlyList<TaskRefDto> TasksCompleted, int ExercisesCompleted,
    int QuestionsPracticed, IReadOnlyList<WeakTopicDto> WeakTopics, IReadOnlyList<ReasonDto> Suggestions,
    IReadOnlyList<DailyMinutesDto> Days);

public record DailyMinutesDto(DateOnly Date, int Minutes);

// ---------- Career readiness ----------

public record EvidenceDto(string Code, double Value, double Target);

public record ReadinessAreaDto(string Key, double Score, string Level, IReadOnlyList<EvidenceDto> Evidence, ReasonDto NextStep);

public record ProjectPortfolioDto(int ProjectId, string Slug, string TitleEn, string TitleAr, IReadOnlyList<PortfolioItemDto> Items);

public record CareerReadinessDto(
    IReadOnlyList<ReadinessAreaDto> Areas, IReadOnlyList<string> TopGaps, IReadOnlyList<ProjectPortfolioDto> Portfolio);

// ---------- Search ----------

public record SearchHitDto(int Id, string TitleEn, string TitleAr, string? SubtitleEn, string? SubtitleAr, int? ParentId, string? Url);

public record SearchGroupDto(string Category, IReadOnlyList<SearchHitDto> Items);

public record SearchResultDto(string Query, IReadOnlyList<SearchGroupDto> Groups);

// ---------- Topic videos ----------

/// <param name="Source">"suggested" (shared YouTube search) or "added" (pasted by this user).</param>
/// <param name="AddedId">Id of the user's own entry, for removing it; null for suggestions.</param>
public record TopicVideoDto(
    string VideoId, string Title, string ChannelTitle, DateTime? PublishedAt, int? DurationSeconds,
    string Source, int? AddedId, bool IsWatched, bool IsBookmarked);

/// <param name="Status">"ok", or why suggestions couldn't be refreshed: "not_configured", "quota_exceeded", "unavailable".</param>
public record TopicVideosDto(string Status, string SearchQuery, IReadOnlyList<TopicVideoDto> Videos);

public record AddTopicVideoRequest([Required, MaxLength(500)] string? Url);

public record UpdateVideoProgressRequest([Required] int? TopicId, [Required] bool? IsWatched, [Required] bool? IsBookmarked);

public record VideoProgressDto(string VideoId, bool IsWatched, bool IsBookmarked);
