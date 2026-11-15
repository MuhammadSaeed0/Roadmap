namespace DevPath.Api.DTOs;

public record ProfileSettingsDto(bool IsPublic, string? Handle);

public record UpdateProfileSettingsRequest(bool IsPublic, string? Handle);

/// <summary>What anyone can see about an account whose owner made the profile public. Never the email.</summary>
public record PublicProfileDto(
    string Handle, string Name, DateTime MemberSince,
    string Level, int Xp, int TopicsCompleted, int AcceptedAnswers, int ReviewedProjects,
    IReadOnlyList<PublicPathDto> Paths, IReadOnlyList<PublicProjectDto> Projects,
    IReadOnlyList<PublicLibraryProjectDto> LibraryProjects);

public record PublicPathDto(int Id, string NameEn, string NameAr, string IconName, double Percent);

/// <summary>A Project library project the owner finished every step of.</summary>
public record PublicLibraryProjectDto(int Id, string TitleEn, string TitleAr, string TechStack, string Level, string? RepositoryUrl);

public record PublicProjectDto(int Id, string TitleEn, string TitleAr, string TechStack, string? RepositoryUrl, bool PeerReviewed);
