using System.Linq.Expressions;
using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

public class StudySessionService(AppDbContext db, TimeProvider clock)
{
    /// <summary>Reusable projection: EF translates it to SQL, so only the needed columns are read.</summary>
    public static readonly Expression<Func<StudySession, StudySessionDto>> Projection = s => new StudySessionDto(
        s.Id, s.TopicId, s.Topic != null ? s.Topic.TitleEn : null, s.Topic != null ? s.Topic.TitleAr : null,
        s.ProjectTaskId, s.ProjectTask != null ? s.ProjectTask.TitleEn : null, s.ProjectTask != null ? s.ProjectTask.TitleAr : null,
        s.PlannedMinutes, s.ActualMinutes, s.SessionDate, s.Note, s.CreatedAt);

    public async Task<IReadOnlyList<StudySessionDto>> ListAsync(DateOnly? from, DateOnly? to, int? topicId, CancellationToken ct)
    {
        var q = db.StudySessions.AsNoTracking();
        if (from is { } f) q = q.Where(s => s.SessionDate >= f);
        if (to is { } t) q = q.Where(s => s.SessionDate <= t);
        if (topicId is { } id) q = q.Where(s => s.TopicId == id);
        return await q.OrderByDescending(s => s.SessionDate).ThenByDescending(s => s.Id)
            .Take(500).Select(Projection).ToListAsync(ct);
    }

    public async Task<StudySessionDto> CreateAsync(CreateStudySessionRequest request, CancellationToken ct)
    {
        if (request.TopicId is { } topicId && !await db.Topics.AnyAsync(t => t.Id == topicId, ct))
            throw new RequestValidationException("topicId", "notFound", "Topic does not exist.");
        if (request.ProjectTaskId is { } taskId && !await db.ProjectTasks.AnyAsync(t => t.Id == taskId, ct))
            throw new RequestValidationException("projectTaskId", "notFound", "Project task does not exist.");

        var today = DateOnly.FromDateTime(clock.GetLocalNow().DateTime);
        if (request.SessionDate > today)
            throw new RequestValidationException("sessionDate", "futureDate", "A study session can't be in the future.");

        var session = new StudySession
        {
            TopicId = request.TopicId,
            ProjectTaskId = request.ProjectTaskId,
            PlannedMinutes = request.PlannedMinutes,
            ActualMinutes = request.ActualMinutes!.Value,
            SessionDate = request.SessionDate!.Value,
            Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
            CreatedAt = clock.GetUtcNow().UtcDateTime
        };
        db.StudySessions.Add(session);

        // Logging a session on a topic you haven't started moves it to "In progress".
        if (request.TopicId is { } id)
        {
            var progress = await db.TopicProgress.FindAsync([id], ct);
            if (progress is null)
                db.TopicProgress.Add(new TopicProgress
                {
                    TopicId = id, Status = TopicStatus.InProgress,
                    StartedAt = session.CreatedAt, UpdatedAt = session.CreatedAt
                });
            else if (progress.Status == TopicStatus.NotStarted)
            {
                progress.Status = TopicStatus.InProgress;
                progress.StartedAt ??= session.CreatedAt;
                progress.UpdatedAt = session.CreatedAt;
            }
        }

        await db.SaveChangesAsync(ct);
        return await db.StudySessions.AsNoTracking().Where(s => s.Id == session.Id).Select(Projection).SingleAsync(ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var deleted = await db.StudySessions.Where(s => s.Id == id).ExecuteDeleteAsync(ct);
        if (deleted == 0) throw new NotFoundException("StudySession", id);
    }
}
