using DevPath.Api.Models;

namespace DevPath.Api.Services.Skills;

// Plain records of the learner's progress, loaded by SkillAssessmentService and scored by SkillCalculator.
// Keeping the calculator free of the database makes every rule easy to unit-test.

public sealed record SkillSnapshot(
    IReadOnlyList<TopicFact> Topics,
    IReadOnlyList<VideoFact> WatchedVideos,
    IReadOnlyDictionary<int, int> CuratedVideosPerTopic,
    IReadOnlyDictionary<int, int> LongestNotePerTopic,
    IReadOnlyList<QuestionFact> Questions,
    IReadOnlyList<AnswerFact> Answers,
    IReadOnlyList<AttemptFact> Attempts,
    IReadOnlyList<InterviewFact> Interviews,
    IReadOnlyList<ExerciseFact> Exercises,
    IReadOnlyList<ProjectFact> Projects,
    int StudyMinutes,
    IReadOnlyList<AcceptedAnswerFact>? AcceptedAnswers = null);

/// <summary>A reply of the learner that another person accepted as the answer to their question.</summary>
public sealed record AcceptedAnswerFact(int ReplyId, int TopicId, string TitleEn, string TitleAr, DateTime At);

public sealed record TopicFact(
    int Id, string Slug, string PhaseSlug, int Position, SkillArea Skill, TopicPriority Priority, Difficulty? Difficulty,
    int Minutes, string TitleEn, string TitleAr, TopicStatus Status, DateTime? CompletedAt, DateTime? UpdatedAt)
{
    public bool IsDone => Status is TopicStatus.Completed or TopicStatus.Skipped;
}

public sealed record VideoFact(string VideoId, int TopicId, DateTime UpdatedAt);

public sealed record QuestionFact(int Id, int TopicId);

public sealed record AnswerFact(int QuestionId, bool IsCorrect, DateTime At);

/// <param name="HasAnswers">False for attempts saved before answers were recorded one by one.</param>
public sealed record AttemptFact(int TopicId, int Level, int Score, int Total, DateTime At, bool HasAnswers)
{
    public bool Passed => Total > 0 && Score * 100 >= Total * QuizService.PassPercent;
}

public sealed record InterviewFact(int Id, int TopicId, InterviewCategory Category, Difficulty Difficulty, InterviewRating? Rating, DateTime? At);

public sealed record ExerciseFact(
    int Id, int TopicId, ExerciseType Type, Difficulty Difficulty, bool HasChecks, IReadOnlyList<SkillArea> Technologies,
    string TitleEn, string TitleAr, PracticeStatus Status, int? BestScore, int HintsRevealed, bool SolutionRevealed,
    bool WroteAnswer, int CriteriaTotal, int CriteriaChecked, DateTime? CompletedAt, ExerciseRunner Runner);

public sealed record ProjectFact(
    int Id, string Slug, int Order, string TitleEn, string TitleAr, bool HasRepository,
    IReadOnlyList<ProjectTaskFact> Tasks, int PortfolioItemsDone, int PortfolioItemsTotal, ProjectReviewFact? Review)
{
    public bool IsComplete => Tasks.Any(t => !t.IsChangeRequest) && Tasks.Where(t => !t.IsChangeRequest).All(t => t.Done);
    public int RequiredTotal => Tasks.Count(t => !t.IsChangeRequest);
    public int RequiredDone => Tasks.Count(t => !t.IsChangeRequest && t.Done);
}

public sealed record ProjectTaskFact(
    int Id, int Minutes, bool IsChangeRequest, IReadOnlyList<int> TopicIds, bool Done, DateTime? CompletedAt,
    string TitleEn, string TitleAr);

public sealed record ProjectReviewFact(IReadOnlyDictionary<string, int> Scores, VerificationTier Verification, DateTime UpdatedAt);
