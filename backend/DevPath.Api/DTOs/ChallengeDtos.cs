using DevPath.Api.Models;

namespace DevPath.Api.DTOs;

public record ChallengeDto(
    int Id, string Key, string TitleEn, string TitleAr, string Domain, Difficulty Difficulty, int EstimatedMinutes, ExerciseRunner Runner,
    int Points, bool Solved, int? BestScore, int Submissions);

public record ChallengeDomainDto(string Key, int Total, int Solved, int Points, int MaxPoints);

public record ChallengesDto(IReadOnlyList<ChallengeDto> Items, IReadOnlyList<ChallengeDomainDto> Domains, int Points, int MaxPoints, int Solved);


public record SubmissionDto(long Id, int Passed, int Total, DateTime CreatedAt);

public record SubmissionDetailDto(long Id, int ExerciseId, int Passed, int Total, DateTime CreatedAt, IReadOnlyList<WorkspaceFileDto> Files);

public record LessonDto(int Id, string Key, int Order, string TitleEn, string TitleAr, string BodyEn, string BodyAr, string? Code, string? CodeLanguage, string? Output);
