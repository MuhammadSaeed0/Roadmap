using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
public class GlossaryController(GlossaryService glossary) : ControllerBase
{
    /// <summary>Every glossary term (English and Arabic) with the topic that explains it. The list only changes with a release.</summary>
    [HttpGet("api/glossary")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Client)]
    public Task<IReadOnlyList<GlossaryTermDto>> Get(CancellationToken ct) => glossary.GetAsync(ct);
}
