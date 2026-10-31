using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services.Cv;

/// <summary>
/// The signed-in user's CVs. Each account sees only its own CVs (query filter on UserId); a CV is private and is
/// only ever rendered for its owner. Duplicating or tailoring makes a new CV and never changes the original.
/// </summary>
public class CvService(AppDbContext db, ICurrentUser currentUser, CvPdfRenderer pdf, CvDocxRenderer docx, TimeProvider clock)
{
    public const int MaxCvsPerUser = 30;
    public const int MaxPhotoBytes = 300 * 1024;

    public async Task<IReadOnlyList<CvSummaryDto>> ListAsync(CancellationToken ct) =>
        await db.CvDocuments.AsNoTracking()
            .OrderByDescending(c => c.UpdatedAt)
            .Select(c => new CvSummaryDto(c.Id, c.Title, c.TemplateKey, c.ParentId, c.TailoredFor, c.Photo != null, c.CreatedAt, c.UpdatedAt))
            .ToListAsync(ct);

    public async Task<CvDto> GetAsync(int id, CancellationToken ct) => ToDto(await FindAsync(id, ct, tracking: false));

    /// <summary>A new CV, started from the account's name and e-mail (the user can change both).</summary>
    public async Task<CvDto> CreateAsync(CreateCvRequest request, CancellationToken ct)
    {
        await EnsureRoomAsync(ct);
        var template = CvTemplates.Get(request.TemplateKey);
        var account = await db.Users.AsNoTracking().Where(u => u.Id == currentUser.Id)
            .Select(u => new { u.FullName, u.Email }).SingleAsync(ct);
        var content = CvRules.Empty(account.FullName, account.Email ?? "", request.TargetRole?.Trim() ?? "");
        var now = clock.GetUtcNow().UtcDateTime;
        var cv = new CvDocument
        {
            Title = request.Title!.Trim(),
            TemplateKey = template.Key,
            ContentJson = CvRules.Serialize(content),
            StyleJson = CvRules.Serialize(CvRules.DefaultStyle(template)),
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.CvDocuments.Add(cv);
        await db.SaveChangesAsync(ct);
        return ToDto(cv);
    }

    public async Task<CvDto> UpdateAsync(int id, UpdateCvRequest request, CancellationToken ct)
    {
        var cv = await FindAsync(id, ct);
        var (template, content, style) = Prepare(request.TemplateKey, request.Content, request.Style);
        cv.Title = request.Title!.Trim();
        cv.TemplateKey = template.Key;
        cv.ContentJson = CvRules.Serialize(content);
        cv.StyleJson = CvRules.Serialize(style);
        cv.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return ToDto(cv);
    }

    /// <summary>A copy of a CV (for example a version tailored to one job). The original is left as it is.</summary>
    public async Task<CvDto> DuplicateAsync(int id, DuplicateCvRequest request, CancellationToken ct)
    {
        await EnsureRoomAsync(ct);
        var source = await FindAsync(id, ct, tracking: false);
        var tailoredFor = string.IsNullOrWhiteSpace(request.TailoredFor) ? source.TailoredFor : request.TailoredFor.Trim();
        var title = string.IsNullOrWhiteSpace(request.Title)
            ? (request.TailoredFor is { Length: > 0 } ? $"{source.Title} – {tailoredFor}" : $"{source.Title} (copy)")
            : request.Title.Trim();
        var now = clock.GetUtcNow().UtcDateTime;
        var copy = new CvDocument
        {
            Title = title.Length > 100 ? title[..100] : title,
            TemplateKey = source.TemplateKey,
            ContentJson = source.ContentJson,
            StyleJson = source.StyleJson,
            Photo = source.Photo,
            PhotoContentType = source.PhotoContentType,
            ParentId = source.Id,
            TailoredFor = tailoredFor,
            CreatedAt = now,
            UpdatedAt = now,
        };
        db.CvDocuments.Add(copy);
        await db.SaveChangesAsync(ct);
        return ToDto(copy);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var cv = await FindAsync(id, ct);
        db.CvDocuments.Remove(cv);
        await db.SaveChangesAsync(ct);
    }

    /// <summary>Stores a profile photo (JPEG or PNG, checked by its content, at most 300 KB).</summary>
    public async Task<CvSummaryDto> SetPhotoAsync(int id, byte[] image, CancellationToken ct)
    {
        if (image.Length == 0 || image.Length > MaxPhotoBytes)
            throw new RequestValidationException("photo", "photo_too_large", "Use a JPEG or PNG photo of at most 300 KB.");
        var type = ImageType(image) ?? throw new RequestValidationException("photo", "photo_type", "Use a JPEG or PNG photo.");
        var cv = await FindAsync(id, ct);
        cv.Photo = image;
        cv.PhotoContentType = type;
        cv.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return Summary(cv);
    }

    public async Task<CvSummaryDto> DeletePhotoAsync(int id, CancellationToken ct)
    {
        var cv = await FindAsync(id, ct);
        cv.Photo = null;
        cv.PhotoContentType = null;
        cv.UpdatedAt = clock.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return Summary(cv);
    }

    public async Task<(byte[] Image, string ContentType)?> GetPhotoAsync(int id, CancellationToken ct)
    {
        var photo = await db.CvDocuments.AsNoTracking().Where(c => c.Id == id)
            .Select(c => new { c.Photo, c.PhotoContentType }).SingleOrDefaultAsync(ct)
            ?? throw new NotFoundException("Cv", id);
        return photo.Photo is null ? null : (photo.Photo, photo.PhotoContentType ?? "image/jpeg");
    }

    /// <summary>Preview pages of an unsaved state of one of the user's CVs (the editor sends what is on screen).</summary>
    public async Task<CvPreviewDto> PreviewAsync(int id, CvRenderRequest request, CancellationToken ct)
    {
        var photo = await PhotoForRenderAsync(id, ct);
        var (template, content, style) = Prepare(request.TemplateKey, request.Content, request.Style, validate: false);
        var pages = pdf.Preview(template, content, style, style.ShowPhoto ? photo : null);
        return new CvPreviewDto(pages.Count, pages.Select(p => "data:image/webp;base64," + Convert.ToBase64String(p)).ToList());
    }

    public async Task<(byte[] File, string FileName)> PdfAsync(int id, CancellationToken ct)
    {
        var cv = await FindAsync(id, ct, tracking: false);
        var (template, content, style) = Parse(cv);
        return (pdf.Pdf(template, content, style, style.ShowPhoto ? cv.Photo : null, cv.Title), FileName(cv, content, "pdf"));
    }

    public async Task<(byte[] File, string FileName)> DocxAsync(int id, CancellationToken ct)
    {
        var cv = await FindAsync(id, ct, tracking: false);
        var (template, content, style) = Parse(cv);
        return (docx.Docx(template, content, style, cv.Title), FileName(cv, content, "docx"));
    }

    /// <summary>The saved CV as the editor and the other CV services see it.</summary>
    public async Task<(CvTemplateDto Template, CvContent Content, CvStyle Style)> LoadAsync(int id, CancellationToken ct) =>
        Parse(await FindAsync(id, ct, tracking: false));

    // ---------------------------------------------------------------- helpers

    public static (CvTemplateDto Template, CvContent Content, CvStyle Style) Prepare(string? templateKey, CvContent? content, CvStyle? style, bool validate = true)
    {
        var template = CvTemplates.Get(templateKey);
        var normalized = CvRules.Normalize(content ?? new CvContent());
        if (validate) CvRules.Validate(normalized);
        return (template, normalized, CvRules.NormalizeStyle(style ?? CvRules.DefaultStyle(template), template));
    }

    private static (CvTemplateDto, CvContent, CvStyle) Parse(CvDocument cv)
    {
        var template = CvTemplates.Get(cv.TemplateKey);
        return (template, CvRules.ParseContent(cv.ContentJson), CvRules.ParseStyle(cv.StyleJson, template));
    }

    private async Task<CvDocument> FindAsync(int id, CancellationToken ct, bool tracking = true)
    {
        var query = tracking ? db.CvDocuments : db.CvDocuments.AsNoTracking();
        return await query.SingleOrDefaultAsync(c => c.Id == id, ct) ?? throw new NotFoundException("Cv", id);
    }

    private async Task<byte[]?> PhotoForRenderAsync(int id, CancellationToken ct)
    {
        var row = await db.CvDocuments.AsNoTracking().Where(c => c.Id == id).Select(c => new { c.Photo }).SingleOrDefaultAsync(ct)
            ?? throw new NotFoundException("Cv", id);
        return row.Photo;
    }

    private async Task EnsureRoomAsync(CancellationToken ct)
    {
        if (await db.CvDocuments.CountAsync(ct) >= MaxCvsPerUser)
            throw new BusinessRuleException("too_many_cvs", $"You can keep up to {MaxCvsPerUser} CVs. Delete one to make room.");
    }

    private static string? ImageType(byte[] b) =>
        b is [0xFF, 0xD8, 0xFF, ..] ? "image/jpeg"
        : b is [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, ..] ? "image/png"
        : null;

    /// <summary>"Sara-Ahmed-CV.pdf": the person's name when there is one, otherwise the CV's title.</summary>
    private static string FileName(CvDocument cv, CvContent content, string extension)
    {
        var name = content.Personal!.FullName.Length > 0 ? content.Personal.FullName + " CV" : cv.Title;
        var safe = new string(name.Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray()).Trim('-');
        while (safe.Contains("--")) safe = safe.Replace("--", "-");
        return (safe.Length > 0 ? safe : "CV") + "." + extension;
    }

    private static CvSummaryDto Summary(CvDocument c) =>
        new(c.Id, c.Title, c.TemplateKey, c.ParentId, c.TailoredFor, c.Photo != null, c.CreatedAt, c.UpdatedAt);

    private static CvDto ToDto(CvDocument c)
    {
        var (template, content, style) = Parse(c);
        return new CvDto(Summary(c) with { TemplateKey = template.Key }, content, style);
    }
}
