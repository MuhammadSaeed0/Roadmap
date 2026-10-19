using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
[Route("api/study-sessions")]
public class StudySessionsController(StudySessionService sessions) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<StudySessionDto>> List([FromQuery] DateOnly? from, [FromQuery] DateOnly? to,
        [FromQuery] int? topicId, CancellationToken ct) => sessions.ListAsync(from, to, topicId, ct);

    [HttpPost]
    public async Task<ActionResult<StudySessionDto>> Create(CreateStudySessionRequest request, CancellationToken ct)
    {
        var session = await sessions.CreateAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, session);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await sessions.DeleteAsync(id, ct);
        return NoContent();
    }
}
