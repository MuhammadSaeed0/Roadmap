using System.ComponentModel.DataAnnotations;

namespace DevPath.Api.DTOs;

// ---------- The CV document (stored as JSON, edited by the client) ----------

public record CvPersonal(
    string FullName = "", string Title = "", string Email = "", string Phone = "", string Location = "",
    string LinkedIn = "", string GitHub = "", string Website = "");

public record CvEducation(
    string Institution = "", string Degree = "", string Field = "", string Start = "", string End = "",
    string Description = "", List<string>? Achievements = null);

public record CvExperience(
    string Title = "", string Company = "", string EmploymentType = "", string Location = "", string Start = "", string End = "",
    bool Current = false, List<string>? Responsibilities = null, List<string>? Achievements = null);

public record CvSkillGroup(string Category = "", List<string>? Items = null);

public record CvProject(
    string Name = "", string Description = "", List<string>? Technologies = null, List<string>? Highlights = null,
    string RepoUrl = "", string DemoUrl = "", string Date = "");

public record CvCertification(string Name = "", string Issuer = "", string Date = "", string Url = "", string Description = "");

public record CvLanguage(string Name = "", string Level = "");

/// <summary>Achievements, volunteering, publications, coursework, open source, interests or any custom section.</summary>
public record CvSection(string Kind = "custom", string Title = "", List<string>? Items = null);

public record CvContent(
    CvPersonal? Personal = null, string Summary = "",
    List<CvEducation>? Education = null, List<CvExperience>? Experience = null, List<CvSkillGroup>? Skills = null,
    List<CvProject>? Projects = null, List<CvCertification>? Certifications = null, List<CvLanguage>? Languages = null,
    List<CvSection>? Sections = null);

/// <param name="Accent">#RRGGBB.</param>
/// <param name="Font">sans, serif or lato.</param>
/// <param name="SectionOrder">Section keys in display order (summary, experience, projects, skills, education, certifications, languages, sections).</param>
/// <param name="Hidden">Section keys that are not shown.</param>
/// <param name="Density">comfortable or compact (compact fits more on one page).</param>
/// <param name="Direction">ltr, or rtl for a CV written in Arabic.</param>
public record CvStyle(
    string Accent = "", string Font = "", List<string>? SectionOrder = null, List<string>? Hidden = null,
    string Density = "comfortable", string Direction = "ltr", bool ShowPhoto = false);

// ---------- API ----------

public record CvTemplateDto(
    string Key, string NameEn, string NameAr, string DescriptionEn, string DescriptionAr,
    string DefaultAccent, string DefaultFont, bool SupportsColor, bool SupportsPhoto, bool AtsFriendly, IReadOnlyList<string> DefaultOrder);

public record CvSummaryDto(int Id, string Title, string TemplateKey, int? ParentId, string? TailoredFor, bool HasPhoto, DateTime CreatedAt, DateTime UpdatedAt);

public record CvDto(CvSummaryDto Summary, CvContent Content, CvStyle Style);

public record CreateCvRequest(
    [Required, MaxLength(100)] string? Title, [Required, MaxLength(40)] string? TemplateKey,
    /// <summary>Optional: a target role, used as the professional title.</summary>
    [MaxLength(120)] string? TargetRole = null);

public record UpdateCvRequest(
    [Required, MaxLength(100)] string? Title, [Required, MaxLength(40)] string? TemplateKey,
    [Required] CvContent? Content, [Required] CvStyle? Style);

public record DuplicateCvRequest([MaxLength(100)] string? Title = null, [MaxLength(150)] string? TailoredFor = null);

/// <summary>Render an unsaved state of a CV (live preview, ATS check) without storing it.</summary>
public record CvRenderRequest([Required, MaxLength(40)] string? TemplateKey, [Required] CvContent? Content, [Required] CvStyle? Style);

public record CvPreviewDto(int PageCount, IReadOnlyList<string> Pages);

// ---------- Suggestions from the learning platform ----------

/// <summary>How strongly the platform's data supports a suggestion.</summary>
/// <param name="Level">verified (passed automatic checks), built (project with a repository), practiced (self-marked exercises or project tasks) or studied (completed topics).</param>
public record CvEvidence(string Level, string DetailEn, string DetailAr);

public record CvSkillSuggestion(string Name, string Category, CvEvidence Evidence);

public record CvProjectSuggestion(
    string Key, string Name, string Status, int TasksDone, int TasksTotal, IReadOnlyList<string> Technologies,
    string Description, IReadOnlyList<string> Highlights, string RepoUrl, string Date, CvEvidence Evidence);

public record CvCourseworkSuggestion(string Title, string Detail, CvEvidence Evidence);

public record CvSuggestionsDto(
    IReadOnlyList<CvSkillSuggestion> Skills, IReadOnlyList<CvProjectSuggestion> Projects,
    IReadOnlyList<CvCourseworkSuggestion> Coursework, string CertificationsNoteEn, string CertificationsNoteAr);

// ---------- ATS check and job matching (rule-based, no AI) ----------

public record CvAtsIssue(string Severity, string Section, string Code, string MessageEn, string MessageAr);

/// <param name="Score">0–100 readiness indicator; a guide, not a guarantee of passing any real ATS.</param>
public record CvAtsReportDto(int Score, IReadOnlyList<CvAtsIssue> Issues, IReadOnlyList<string> MatchedKeywords, IReadOnlyList<string> MissingKeywords);

public record CvAtsRequest(
    [Required, MaxLength(40)] string? TemplateKey, [Required] CvContent? Content, [Required] CvStyle? Style,
    [MaxLength(20000)] string? JobDescription = null);

public record CvJobMatchRequest([Required, MaxLength(20000)] string? JobDescription);

public record CvJobMatchDto(
    IReadOnlyList<string> JobKeywords, IReadOnlyList<string> Matched, IReadOnlyList<string> MissingButLearning,
    IReadOnlyList<string> Missing, IReadOnlyList<string> ProjectsToHighlight, IReadOnlyList<string> SuggestedOrder);
