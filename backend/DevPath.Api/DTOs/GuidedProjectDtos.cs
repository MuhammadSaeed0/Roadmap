using DevPath.Api.Models;

namespace DevPath.Api.DTOs;

/// <summary>A Project library card: what it is, how big it is, and how far the learner got.</summary>
public record GuidedProjectSummaryDto(
    int Id, string Key, SkillArea Skill, Difficulty Level, int EstimatedHours,
    string TitleEn, string TitleAr, string SummaryEn, string SummaryAr, string TechStack,
    int StepCount, int DoneSteps);

public record GuidedStepDto(
    int Id, string Key, int Order, string TitleEn, string TitleAr, string BodyEn, string BodyAr,
    string? Code, string? CodeLanguage, IReadOnlyList<string> HintsEn, IReadOnlyList<string> HintsAr,
    bool Done, DateTime? CompletedAt);

public record GuidedProjectDetailDto(
    int Id, string Key, SkillArea Skill, Difficulty Level, int EstimatedHours,
    string TitleEn, string TitleAr, string SummaryEn, string SummaryAr, string TechStack,
    IReadOnlyList<string> GoalsEn, IReadOnlyList<string> GoalsAr,
    IReadOnlyList<string> RequirementsEn, IReadOnlyList<string> RequirementsAr,
    IReadOnlyList<string> AcceptanceEn, IReadOnlyList<string> AcceptanceAr,
    IReadOnlyList<string> StretchEn, IReadOnlyList<string> StretchAr,
    IReadOnlyList<GuidedStepDto> Steps,
    /// <summary>The other projects of the same skill, easiest first, so the learner can move up a level.</summary>
    IReadOnlyList<GuidedProjectSummaryDto> SameSkill,
    /// <summary>The learner's repository for this project, once they built it.</summary>
    string? RepositoryUrl = null,
    /// <summary>The roadmap topics the project practises, in roadmap order.</summary>
    IReadOnlyList<int>? TopicIds = null);

/// <summary>A library project suggested on a topic page because it practises that topic.</summary>
public record GuidedProjectRefDto(int Id, SkillArea Skill, Difficulty Level, string TitleEn, string TitleAr, int StepCount, int DoneSteps);

/// <summary>The library project the learner is working on, with the step to do next.</summary>
public record CurrentGuidedProjectDto(
    int Id, SkillArea Skill, Difficulty Level, string TitleEn, string TitleAr, int StepCount, int DoneSteps,
    string NextStepTitleEn, string NextStepTitleAr);

public record GuidedStepUpdate(bool Done);
