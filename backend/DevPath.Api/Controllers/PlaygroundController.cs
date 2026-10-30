using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>Saved Code Playground projects of the signed-in user.</summary>
[ApiController]
[Route("api/playground/projects")]
public class PlaygroundController(PlaygroundService playground) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<PlaygroundProjectSummaryDto>> List(CancellationToken ct) => playground.ListAsync(ct);

    [HttpGet("{id:int}")]
    public Task<PlaygroundProjectDto> Get(int id, CancellationToken ct) => playground.GetAsync(id, ct);

    [HttpPost, RequestSizeLimit(1_000_000)]
    public async Task<ActionResult<PlaygroundProjectDto>> Create(CreatePlaygroundProjectRequest request, CancellationToken ct)
    {
        var project = await playground.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = project.Summary.Id }, project);
    }

    [HttpPut("{id:int}"), RequestSizeLimit(1_000_000)]
    public Task<PlaygroundProjectDto> Update(int id, UpdatePlaygroundProjectRequest request, CancellationToken ct) =>
        playground.UpdateAsync(id, request, ct);

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await playground.DeleteAsync(id, ct);
        return NoContent();
    }
}
