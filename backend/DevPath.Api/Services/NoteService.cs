using System.Linq.Expressions;
using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

public record NoteQuery(string? Q, int? TopicId, int? ProjectId, int? ProjectTaskId, int? InterviewQuestionId);

public class NoteService(AppDbContext db, TimeProvider clock)
{
    private static readonly Expression<Func<Note, NoteDto>> Projection = n => new NoteDto(
        n.Id, n.Title, n.Content,
        n.TopicId != null ? "topic" : n.ProjectId != null ? "project" : n.ProjectTaskId != null ? "task"
            : n.InterviewQuestionId != null ? "question" : null,
        n.TopicId ?? n.ProjectId ?? n.ProjectTaskId ?? n.InterviewQuestionId,
        n.Topic != null ? n.Topic.TitleEn : n.Project != null ? n.Project.TitleEn
            : n.ProjectTask != null ? n.ProjectTask.TitleEn : n.InterviewQuestion != null ? n.InterviewQuestion.QuestionEn : null,
        n.Topic != null ? n.Topic.TitleAr : n.Project != null ? n.Project.TitleAr
            : n.ProjectTask != null ? n.ProjectTask.TitleAr : n.InterviewQuestion != null ? n.InterviewQuestion.QuestionAr : null,
        // For a task, the UI needs the project id to build the link.
        n.ProjectTask != null ? n.ProjectTask.Milestone.ProjectId : null,
        n.CreatedAt, n.UpdatedAt);

    public async Task<IReadOnlyList<NoteDto>> ListAsync(NoteQuery query, CancellationToken ct)
    {
        var q = db.Notes.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query.Q))
        {
            var pattern = SearchService.LikePattern(query.Q);
            q = q.Where(n => EF.Functions.Like(n.Title, pattern) || EF.Functions.Like(n.Content, pattern));
        }
        if (query.TopicId is { } topicId) q = q.Where(n => n.TopicId == topicId);
        if (query.ProjectId is { } projectId)
            q = q.Where(n => n.ProjectId == projectId || (n.ProjectTask != null && n.ProjectTask.Milestone.ProjectId == projectId));
        if (query.ProjectTaskId is { } taskId) q = q.Where(n => n.ProjectTaskId == taskId);
        if (query.InterviewQuestionId is { } questionId) q = q.Where(n => n.InterviewQuestionId == questionId);

        return await q.OrderByDescending(n => n.UpdatedAt).Take(200).Select(Projection).ToListAsync(ct);
    }

    public async Task<NoteDto> GetAsync(int id, CancellationToken ct) =>
        await db.Notes.AsNoTracking().Where(n => n.Id == id).Select(Projection).SingleOrDefaultAsync(ct)
        ?? throw new NotFoundException("Note", id);

    public async Task<NoteDto> CreateAsync(NoteRequest request, CancellationToken ct)
    {
        await ValidateLinksAsync(request, ct);
        var now = clock.GetUtcNow().UtcDateTime;
        var note = new Note { Title = request.Title!.Trim(), CreatedAt = now };
        Apply(note, request, now);
        db.Notes.Add(note);
        await db.SaveChangesAsync(ct);
        return await GetAsync(note.Id, ct);
    }

    public async Task<NoteDto> UpdateAsync(int id, NoteRequest request, CancellationToken ct)
    {
        var note = await db.Notes.FindAsync([id], ct) ?? throw new NotFoundException("Note", id);
        await ValidateLinksAsync(request, ct);
        Apply(note, request, clock.GetUtcNow().UtcDateTime);
        await db.SaveChangesAsync(ct);
        return await GetAsync(id, ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        if (await db.Notes.Where(n => n.Id == id).ExecuteDeleteAsync(ct) == 0)
            throw new NotFoundException("Note", id);
    }

    private static void Apply(Note note, NoteRequest r, DateTime now)
    {
        note.Title = r.Title!.Trim();
        note.Content = r.Content ?? "";
        note.TopicId = r.TopicId;
        note.ProjectId = r.ProjectId;
        note.ProjectTaskId = r.ProjectTaskId;
        note.InterviewQuestionId = r.InterviewQuestionId;
        note.UpdatedAt = now;
    }

    /// <summary>Return a 400 with a field error (instead of a FK violation 500) when a link doesn't exist.</summary>
    private async Task ValidateLinksAsync(NoteRequest r, CancellationToken ct)
    {
        if (r.TopicId is { } t && !await db.Topics.AnyAsync(x => x.Id == t, ct))
            throw new RequestValidationException("topicId", "notFound", "Topic does not exist.");
        if (r.ProjectId is { } p && !await db.Projects.AnyAsync(x => x.Id == p, ct))
            throw new RequestValidationException("projectId", "notFound", "Project does not exist.");
        if (r.ProjectTaskId is { } pt && !await db.ProjectTasks.AnyAsync(x => x.Id == pt, ct))
            throw new RequestValidationException("projectTaskId", "notFound", "Project task does not exist.");
        if (r.InterviewQuestionId is { } q && !await db.InterviewQuestions.AnyAsync(x => x.Id == q, ct))
            throw new RequestValidationException("interviewQuestionId", "notFound", "Interview question does not exist.");
    }
}
