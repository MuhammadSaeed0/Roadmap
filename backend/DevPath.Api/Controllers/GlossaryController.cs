using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
public class GlossaryController(GlossaryService glossary, TrackContext tracks) : ControllerBase
{
    /// <summary>Every glossary term (English and Arabic) with the topic that explains it. The list only changes with a release.</summary>
    [HttpGet("api/glossary")]
    public async Task<IReadOnlyList<GlossaryTermDto>> Get(CancellationToken ct, [FromQuery] bool all = false)
    {
        var terms = await glossary.GetAsync(ct);
        return await tracks.TopicIdsAsync(all, ct) is { } ids ? terms.Where(t => ids.Contains(t.TopicId)).ToList() : terms;
    }
}
