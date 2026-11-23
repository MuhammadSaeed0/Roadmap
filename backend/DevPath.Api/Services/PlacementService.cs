using DevPath.Api.Data;
using DevPath.Api.DTOs;
using DevPath.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// An optional placement check for new learners, built from the topic quiz bank: two questions from
/// each of the first phases, served without their answers and graded here. Grading changes nothing;
/// only <see cref="ApplyAsync"/>, which the learner calls after ticking phases, marks topics.
/// </summary>
public class PlacementService(AppDbContext db, TimeProvider clock)
{
    public const int PerPhase = 2;
    /// <summary>The check covers phases 1 to this one (by roadmap order).</summary>
    public const int LastPhaseOrder = 8;
    public const int KnownConfidence = 4;

    public async Task<PlacementQuizDto> GetAsync(CancellationToken ct)
    {
        var questions = await QuestionsAsync(ct);
        var picked = new List<QuizQuestion>();
        foreach (var phase in questions.GroupBy(q => q.Topic.PhaseId))
        {
            // One question from each of two different topics, so a phase isn't judged on a single topic.
            var topics = Shuffle(phase.GroupBy(q => q.TopicId).ToList());
            picked.AddRange(topics.Take(PerPhase).Select(t => t.ElementAt(Random.Shared.Next(t.Count()))));
            if (topics.Count < PerPhase)
                picked.AddRange(Shuffle(phase.Except(picked).ToList()).Take(PerPhase - topics.Count));
        }
        var dtos = Shuffle(picked).Select(q => new PlacementQuestionDto(q.Id, q.Topic.PhaseId,
            q.QuestionEn, q.QuestionAr, q.OptionsEn, q.OptionsAr)).ToList();
        return new PlacementQuizDto(PerPhase, dtos);
    }

    public async Task<PlacementResultDto> GradeAsync(SubmitPlacementRequest request, CancellationToken ct)
    {
        var answers = request.Answers!;
        var questions = (await QuestionsAsync(ct)).ToDictionary(q => q.Id);
        var phases = await PhasesAsync(ct);

        var ids = answers.Select(a => a.QuestionId!.Value).ToList();
        if (ids.Distinct().Count() != ids.Count || !ids.All(questions.ContainsKey))
            throw Invalid("Answer each question of the placement check once.");
        var perPhase = ids.GroupBy(id => questions[id].Topic.PhaseId).ToDictionary(g => g.Key, g => g.Count());
        if (phases.Any(p => perPhase.GetValueOrDefault(p.Id) != Math.Min(PerPhase, p.QuestionCount)))
            throw Invalid($"Answer {PerPhase} questions from each phase.");

        var graded = new List<(int PhaseId, bool IsCorrect)>();
        foreach (var a in answers)
        {
            var q = questions[a.QuestionId!.Value];
            var choice = a.Choice!.Value;
            if (choice < 0 || choice >= q.OptionsEn.Count) throw Invalid("An answer points to an option that doesn't exist.");
            graded.Add((q.Topic.PhaseId, choice == q.AnswerIndex));
        }

        var scores = Score(graded).ToDictionary(s => s.PhaseId);
        return new PlacementResultDto(phases.Select(p =>
        {
            var s = scores.GetValueOrDefault(p.Id);
            return new PlacementPhaseResultDto(p.Id, p.Order, p.TitleEn, p.TitleAr, p.TopicCount, s.Correct, s.Total, s.Known);
        }).ToList());
    }

    /// <summary>Per phase: how many answers were right, and whether all of them were ("you seem to know this").</summary>
    public static IReadOnlyList<(int PhaseId, int Correct, int Total, bool Known)> Score(IEnumerable<(int PhaseId, bool IsCorrect)> answers) =>
        answers.GroupBy(a => a.PhaseId)
            .Select(g => (g.Key, g.Count(a => a.IsCorrect), g.Count(), g.All(a => a.IsCorrect)))
            .OrderBy(s => s.Key)
            .ToList();

    /// <summary>
    /// Marks every topic of the chosen phases as skipped and already known, for the signed-in learner.
    /// Completed topics stay completed. Sending the same request again changes nothing.
    /// One SaveChanges call, so all the topics are marked in a single transaction or none are.
    /// </summary>
    public async Task<ApplyPlacementResultDto> ApplyAsync(ApplyPlacementRequest request, CancellationToken ct)
    {
        var chosen = request.PhaseIds!.Distinct().ToList();
        var allowed = (await PhasesAsync(ct)).Select(p => p.Id).ToHashSet();
        if (chosen.Count == 0 || !chosen.All(allowed.Contains))
            throw new RequestValidationException("phaseIds", "placement_invalid_phases", "Choose one or more phases from the placement check.");

        var topicIds = await db.Topics.Where(t => chosen.Contains(t.PhaseId)).Select(t => t.Id).ToListAsync(ct);
        // TopicProgress is filtered to the signed-in account, so only this learner's rows are read or written.
        var existing = await db.TopicProgress.Where(p => topicIds.Contains(p.TopicId)).ToDictionaryAsync(p => p.TopicId, ct);
        var now = clock.GetUtcNow().UtcDateTime;
        var changed = 0;
        foreach (var topicId in topicIds)
        {
            if (!existing.TryGetValue(topicId, out var progress))
            {
                progress = new TopicProgress { TopicId = topicId };
                db.TopicProgress.Add(progress);
            }
            else if (progress.Status == TopicStatus.Completed
                || (progress.Status == TopicStatus.Skipped && progress.Knowledge == KnowledgeLevel.AlreadyKnow && progress.Confidence == KnownConfidence))
            {
                continue;
            }
            progress.Status = TopicStatus.Skipped;
            progress.Knowledge = KnowledgeLevel.AlreadyKnow;
            progress.Confidence = KnownConfidence;
            progress.StartedAt ??= now;
            progress.CompletedAt ??= now;
            progress.UpdatedAt = now;
            changed++;
        }
        await db.SaveChangesAsync(ct);
        return new ApplyPlacementResultDto(chosen.Order().ToList(), changed);
    }

    private record PhaseInfo(int Id, int Order, string TitleEn, string TitleAr, int TopicCount, int QuestionCount);

    private async Task<List<PhaseInfo>> PhasesAsync(CancellationToken ct)
    {
        var phases = await db.Phases.AsNoTracking().Where(p => p.Order >= 1 && p.Order <= LastPhaseOrder).OrderBy(p => p.Order)
            .Select(p => new { p.Id, p.Order, p.TitleEn, p.TitleAr, Topics = p.Topics.Count })
            .ToListAsync(ct);
        var ids = phases.Select(p => p.Id).ToList();
        var counts = await db.QuizQuestions.AsNoTracking().Where(q => ids.Contains(q.Topic.PhaseId))
            .GroupBy(q => q.Topic.PhaseId).Select(g => new { g.Key, Count = g.Count() }).ToDictionaryAsync(g => g.Key, g => g.Count, ct);
        return phases.Where(p => counts.GetValueOrDefault(p.Id) > 0)
            .Select(p => new PhaseInfo(p.Id, p.Order, p.TitleEn, p.TitleAr, p.Topics, counts[p.Id])).ToList();
    }

    private Task<List<QuizQuestion>> QuestionsAsync(CancellationToken ct) =>
        db.QuizQuestions.AsNoTracking().Include(q => q.Topic)
            .Where(q => q.Topic.Phase.Order >= 1 && q.Topic.Phase.Order <= LastPhaseOrder)
            .ToListAsync(ct);

    private static List<T> Shuffle<T>(List<T> list)
    {
        Random.Shared.Shuffle(System.Runtime.InteropServices.CollectionsMarshal.AsSpan(list));
        return list;
    }

    private static RequestValidationException Invalid(string message) => new("answers", "placement_invalid_answers", message);
}
