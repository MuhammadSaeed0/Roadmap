using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

[ApiController]
[Route("api/notes")]
public class NotesController(NoteService notes) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<NoteDto>> List([FromQuery] string? q, [FromQuery] int? topicId, [FromQuery] int? projectId,
        [FromQuery] int? projectTaskId, [FromQuery] int? interviewQuestionId, CancellationToken ct) =>
        notes.ListAsync(new NoteQuery(q, topicId, projectId, projectTaskId, interviewQuestionId), ct);

    [HttpGet("{id:int}")]
    public Task<NoteDto> Get(int id, CancellationToken ct) => notes.GetAsync(id, ct);

    [HttpPost]
    public async Task<ActionResult<NoteDto>> Create(NoteRequest request, CancellationToken ct)
    {
        var note = await notes.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = note.Id }, note);
    }

    [HttpPut("{id:int}")]
    public Task<NoteDto> Update(int id, NoteRequest request, CancellationToken ct) => notes.UpdateAsync(id, request, ct);

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await notes.DeleteAsync(id, ct);
        return NoContent();
    }
}
