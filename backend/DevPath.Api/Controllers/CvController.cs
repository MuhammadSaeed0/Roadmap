using System.Collections.Concurrent;
using DevPath.Api.DTOs;
using DevPath.Api.Services;
using DevPath.Api.Services.Cv;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace DevPath.Api.Controllers;

/// <summary>The CV builder: the signed-in user's CVs, previews, exports, suggestions and checks.</summary>
[ApiController]
[Route("api/cv")]
public class CvController(CvService cvs, CvSuggestionService suggestions, CvAnalysisService analysis, CvPdfRenderer pdf) : ControllerBase
{
    private const string Docx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    private static readonly ConcurrentDictionary<string, byte[]> Thumbnails = new();

    [HttpGet("templates")]
    public IReadOnlyList<CvTemplateDto> Templates() => CvTemplates.All;

    /// <summary>What a template looks like, filled with a fictional sample CV (cached; the same for everyone).</summary>
    [HttpGet("templates/{key}/thumbnail")]
    [ResponseCache(Duration = 86400)]
    public IActionResult Thumbnail(string key)
    {
        var template = CvTemplates.Get(key);
        var image = Thumbnails.GetOrAdd(template.Key, _ =>
            pdf.Preview(template, CvSamples.Content, CvRules.DefaultStyle(template), null, 40)[0]);
        return File(image, "image/webp");
    }

    [HttpGet]
    public Task<IReadOnlyList<CvSummaryDto>> List(CancellationToken ct) => cvs.ListAsync(ct);

    [HttpGet("{id:int}")]
    public Task<CvDto> Get(int id, CancellationToken ct) => cvs.GetAsync(id, ct);

    [HttpPost]
    public async Task<ActionResult<CvDto>> Create(CreateCvRequest request, CancellationToken ct)
    {
        var cv = await cvs.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = cv.Summary.Id }, cv);
    }

    [HttpPut("{id:int}"), RequestSizeLimit(400_000)]
    public Task<CvDto> Update(int id, UpdateCvRequest request, CancellationToken ct) => cvs.UpdateAsync(id, request, ct);

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await cvs.DeleteAsync(id, ct);
        return NoContent();
    }

    /// <summary>A copy (for example a version tailored to one job); the original is not changed.</summary>
    [HttpPost("{id:int}/duplicate")]
    public async Task<ActionResult<CvDto>> Duplicate(int id, DuplicateCvRequest request, CancellationToken ct)
    {
        var cv = await cvs.DuplicateAsync(id, request, ct);
        return CreatedAtAction(nameof(Get), new { id = cv.Summary.Id }, cv);
    }

    [HttpGet("{id:int}/photo")]
    public async Task<IActionResult> Photo(int id, CancellationToken ct)
    {
        var photo = await cvs.GetPhotoAsync(id, ct);
        if (photo is null) return NotFound();
        Response.Headers.CacheControl = "private, no-cache";
        return File(photo.Value.Image, photo.Value.ContentType);
    }

    [HttpPut("{id:int}/photo"), RequestSizeLimit(CvService.MaxPhotoBytes + 20_000)]
    public async Task<CvSummaryDto> SetPhoto(int id, IFormFile photo, CancellationToken ct)
    {
        if (photo.Length > CvService.MaxPhotoBytes)
            throw new RequestValidationException("photo", "photo_too_large", "Use a JPEG or PNG photo of at most 300 KB.");
        using var buffer = new MemoryStream();
        await photo.CopyToAsync(buffer, ct);
        return await cvs.SetPhotoAsync(id, buffer.ToArray(), ct);
    }

    [HttpDelete("{id:int}/photo")]
    public Task<CvSummaryDto> DeletePhoto(int id, CancellationToken ct) => cvs.DeletePhotoAsync(id, ct);

    /// <summary>Preview pages for what is on screen in the editor (not saved).</summary>
    [HttpPost("{id:int}/preview"), RequestSizeLimit(400_000), EnableRateLimiting(CvRateLimits.Render)]
    public Task<CvPreviewDto> Preview(int id, CvRenderRequest request, CancellationToken ct) => cvs.PreviewAsync(id, request, ct);

    [HttpGet("{id:int}/pdf"), EnableRateLimiting(CvRateLimits.Render)]
    public async Task<IActionResult> Pdf(int id, CancellationToken ct)
    {
        var (file, name) = await cvs.PdfAsync(id, ct);
        return File(file, "application/pdf", name);
    }

    [HttpGet("{id:int}/docx"), EnableRateLimiting(CvRateLimits.Render)]
    public async Task<IActionResult> Word(int id, CancellationToken ct)
    {
        var (file, name) = await cvs.DocxAsync(id, ct);
        return File(file, Docx, name);
    }

    /// <summary>Skills, projects and coursework the platform can vouch for, with how strong the evidence is.</summary>
    [HttpGet("suggestions")]
    public Task<CvSuggestionsDto> Suggestions([FromQuery] string? lang, CancellationToken ct) =>
        suggestions.GetAsync(string.Equals(lang, "ar", StringComparison.OrdinalIgnoreCase), ct);

    /// <summary>ATS-readiness review of what is on screen (rule-based; a guide, not a guarantee).</summary>
    [HttpPost("ats-check"), RequestSizeLimit(400_000), EnableRateLimiting(CvRateLimits.Render)]
    public CvAtsReportDto AtsCheck(CvAtsRequest request)
    {
        var (template, content, style) = CvService.Prepare(request.TemplateKey, request.Content, request.Style, validate: false);
        return analysis.Check(template, content, style, request.JobDescription);
    }

    /// <summary>Keyword match between a saved CV and a job description (rule-based).</summary>
    [HttpPost("{id:int}/job-match")]
    public async Task<CvJobMatchDto> JobMatch(int id, CvJobMatchRequest request, CancellationToken ct)
    {
        var (_, content, style) = await cvs.LoadAsync(id, ct);
        return await analysis.MatchAsync(content, style, request.JobDescription!, ct);
    }
}

public static class CvRateLimits
{
    /// <summary>Previews, exports and ATS checks: rendering costs CPU.</summary>
    public const string Render = "cv-render";
}
