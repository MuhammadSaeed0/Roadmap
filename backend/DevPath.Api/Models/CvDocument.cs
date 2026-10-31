namespace DevPath.Api.Models;

/// <summary>
/// One CV of a user. Its sections are stored as validated JSON (see <c>CvContent</c>) and its look as a template key
/// plus style options, so templates and sections can be added without schema changes. Tailored versions are
/// separate CVs that point back to the CV they were made from.
/// </summary>
public class CvDocument : IUserOwned
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public string Title { get; set; } = "";
    public string TemplateKey { get; set; } = "";
    /// <summary>JSON <c>CvStyle</c>: accent colour, font, section order and visibility, density, direction, photo.</summary>
    public string StyleJson { get; set; } = "{}";
    /// <summary>JSON <c>CvContent</c>: every section of the CV.</summary>
    public string ContentJson { get; set; } = "{}";
    /// <summary>Optional profile photo (JPEG or PNG, at most 300 KB).</summary>
    public byte[]? Photo { get; set; }
    public string? PhotoContentType { get; set; }
    /// <summary>The CV this one was tailored or duplicated from, if any (kept even if that CV is deleted later).</summary>
    public int? ParentId { get; set; }
    /// <summary>For tailored versions: the job they were tailored for.</summary>
    public string? TailoredFor { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
