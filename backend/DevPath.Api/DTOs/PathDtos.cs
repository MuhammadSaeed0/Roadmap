using System.ComponentModel.DataAnnotations;

namespace DevPath.Api.DTOs;

// ---------- Learning Paths ----------

public record PathSummaryDto(
    int Id, string Slug, string NameEn, string NameAr,
    string DescriptionEn, string DescriptionAr, string IconName,
    bool IsBuiltIn, bool IsPublic, string? CreatorName,
    int TopicCount, double ProgressPercent, bool IsActivated);

public record PathDetailDto(
    int Id, string Slug, string NameEn, string NameAr,
    string DescriptionEn, string DescriptionAr, string IconName,
    bool IsBuiltIn, bool IsPublic, string? CreatorId, string? CreatorName,
    DateTime CreatedAt, bool IsActivated,
    IReadOnlyList<PathPhaseDto> Phases,
    IReadOnlyList<PathTopicDto> Topics);

public record PathPhaseDto(int PhaseId, string PhaseNameEn, string PhaseNameAr, int SortOrder, IReadOnlyList<PathTopicDto> Topics);

public record PathTopicDto(int TopicId, string TitleEn, string TitleAr, int SortOrder, string Status);

public record CreatePathRequest(
    [MaxLength(80)] string? Slug,
    [Required, MaxLength(150)] string NameEn,
    [Required, MaxLength(150)] string NameAr,
    [MaxLength(1000)] string? DescriptionEn,
    [MaxLength(1000)] string? DescriptionAr,
    [MaxLength(40)] string? IconName,
    [Required, MaxLength(50)] int[] TopicIds);

public record UpdatePathRequest(
    [Required, MaxLength(150)] string NameEn,
    [Required, MaxLength(150)] string NameAr,
    [MaxLength(1000)] string? DescriptionEn,
    [MaxLength(1000)] string? DescriptionAr,
    [MaxLength(40)] string? IconName,
    [Required, MaxLength(50)] int[] TopicIds);
