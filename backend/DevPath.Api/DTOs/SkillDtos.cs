using System.ComponentModel.DataAnnotations;
using DevPath.Api.Models;
using DevPath.Api.Services.Skills;

namespace DevPath.Api.DTOs;

/// <param name="XpAheadOfSkills">True when the points alone would give a higher level than the competencies support.</param>
public record SkillLevelDto(
    string Level, int LevelIndex, string? NextLevel, string XpLevel, bool XpAheadOfSkills,
    int Xp, int MaxXp, double Overall, double ProgressToNext, IReadOnlyList<LevelStatus> Levels,
    IReadOnlyList<CategoryScoreDto> Categories, IReadOnlyList<TechnologyScore> Technologies, SkillStats Stats,
    IReadOnlyList<string> WeakCategories, IReadOnlyList<WeakTopic> WeakTopics,
    IReadOnlyList<NextLevelRequirement> NextLevelRequirements, IReadOnlyList<AssessmentItem> Assessment,
    IReadOnlyList<XpTransactionDto> RecentTransactions, IReadOnlyList<LevelChangeDto> LevelHistory);

public record CategoryScoreDto(string Key, double Weight, double Score, string Proficiency, IReadOnlyList<EvidenceScore> Evidence, int Points, int MaxPoints);

public record XpTransactionDto(
    long Id, string SourceKey, XpActivity Activity, EvidenceKind Evidence, VerificationTier Verification,
    int Points, int Balance, IReadOnlyList<string> Categories, DateTime? OccurredAt, DateTime CreatedAt);

public record PagedXpDto(IReadOnlyList<XpTransactionDto> Items, int Page, int PageSize, int Total);

public record LevelChangeDto(string Level, string PreviousLevel, int Xp, double Overall, DateTime ChangedAt);

public record SkillRulesDto(
    PointRules Points, IReadOnlyDictionary<VerificationTier, double> Verification, IReadOnlyDictionary<EvidenceKind, double> EvidenceWeights,
    IReadOnlyList<CategoryRuleDto> Categories, IReadOnlyList<LevelRuleDto> Levels, IReadOnlyList<string> ReviewCriteria);

public record CategoryRuleDto(string Key, double Weight, SkillArea? Skill);

public record LevelRuleDto(string Key, int MinXp, double MinOverall, IReadOnlyDictionary<string, double> Categories,
    int MinProjectTasks, int MinProjectsCompleted, int MinAdvancedProjects);

/// <param name="CountsTowardsLevel">The review earns points only once every required task of the project is completed.</param>
public record ProjectAssessmentDto(
    int ProjectId, IReadOnlyList<string> Criteria, IReadOnlyDictionary<string, int> Scores, string? Notes,
    VerificationTier Verification, DateTime? UpdatedAt, bool CountsTowardsLevel);

public class SaveProjectAssessmentRequest
{
    /// <summary>Criterion key → score from 0 (missing) to 4 (excellent).</summary>
    [Required] public Dictionary<string, int>? Scores { get; set; }
    [MaxLength(4000)] public string? Notes { get; set; }
}
