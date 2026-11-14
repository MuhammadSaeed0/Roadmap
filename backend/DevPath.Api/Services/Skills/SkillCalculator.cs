using DevPath.Api.Models;

namespace DevPath.Api.Services.Skills;

/// <summary>Where an opportunity points in the app, so recommendations can link to it.</summary>
public sealed record ItemRef(string Type, int Id, int? Level = null);

/// <summary>
/// Something in the roadmap that can earn points: a quiz question, a topic, an exercise, a project task ...
/// <see cref="MaxPoints"/> is what it is worth when fully verified; <see cref="Points"/> is what the learner has earned
/// from it now. The ledger keeps each source's total equal to <see cref="Points"/>.
/// </summary>
public sealed record Opportunity(
    string Key, XpActivity Activity, EvidenceKind Evidence, VerificationTier Verification,
    int Points, int MaxPoints, IReadOnlyList<string> Categories, IReadOnlyList<SkillArea> Skills,
    DateTime? OccurredAt, string TitleEn, string TitleAr, ItemRef? Ref, int CappedPoints = 0);

public sealed record EvidenceScore(EvidenceKind Kind, double Score, int Points, int MaxPoints);

public sealed record CategoryScore(string Key, double Weight, double Score, IReadOnlyList<EvidenceScore> Evidence, int Points, int MaxPoints);

public sealed record TechnologyScore(
    SkillArea Skill, double Score, IReadOnlyList<EvidenceScore> Evidence, int Points,
    int TopicsDone, int TopicsTotal, int ExercisesDone, int ProjectTasksDone, int QuestionsAnswered, double? Accuracy, string Proficiency);

public sealed record Requirement(string Code, string? Category, double Current, double Required, bool Met);

public sealed record LevelStatus(string Key, int Index, int MinXp, bool Met, IReadOnlyList<Requirement> Requirements);

public sealed record Recommendation(string Code, string? Category, ItemRef? Ref, string? TitleEn, string? TitleAr, double? Amount = null);

public sealed record NextLevelRequirement(Requirement Requirement, IReadOnlyList<Recommendation> Actions);

public sealed record WeakTopic(int TopicId, string TitleEn, string TitleAr, string Category, int Answered, int Correct, double Accuracy);

public sealed record AssessmentItem(string Category, string Band, bool Stale, IReadOnlyList<Recommendation> Checks);

public sealed record SkillStats(
    int VideosWatched, int QuestionsAnswered, int CorrectAnswers, double? Accuracy, int QuizAttempts,
    int TopicsCompleted, int ExercisesCompleted, int ProjectTasksCompleted, int ProjectsCompleted,
    double LearningHours, int TechnologiesMastered, int VerifiedPoints, int SelfReportedPoints);

public sealed record SkillResult(
    int Xp, int MaxXp, double Overall, string Level, int LevelIndex, string XpLevel, double ProgressToNext,
    IReadOnlyList<LevelStatus> Levels, IReadOnlyList<CategoryScore> Categories, IReadOnlyList<TechnologyScore> Technologies,
    IReadOnlyList<Opportunity> Opportunities, SkillStats Stats, IReadOnlyList<string> WeakCategories, IReadOnlyList<WeakTopic> WeakTopics,
    IReadOnlyList<NextLevelRequirement> NextLevel, IReadOnlyList<AssessmentItem> Assessment);

/// <summary>
/// Turns a progress snapshot into points, competency scores and a developer level. Pure: no database, no clock
/// except <paramref name="now"/>, so every rule is unit-tested in SkillCalculatorTests.
///
/// The rules, in short:
/// * Each item earns points once. Self-reported evidence is multiplied by a lower factor than evidence the server checked.
/// * A category's score (0–100) is the share of its available points earned, per evidence kind, combined with the
///   evidence weights (passive 5%, knowledge 20%, practical 25%, project 40%, quality 10%).
/// * The level is the highest one whose XP, overall score, per-category minimums and project counts are ALL met, so
///   points from one area can't make up for a gap in another.
/// </summary>
public sealed class SkillCalculator(SkillRules rules)
{
    private const double WeakTopicAccuracy = 60;
    private const int WeakTopicMinAnswers = 3;

    public SkillResult Calculate(SkillSnapshot s, DateTime now)
    {
        var topics = s.Topics.ToDictionary(t => t.Id);
        var categoryOf = s.Topics.ToDictionary(t => t.Id, t => rules.CategoryOfTopic(t.Slug, t.PhaseSlug));
        var passedLevels = s.Attempts.Where(a => a.Passed).Select(a => (a.TopicId, a.Level)).ToHashSet();
        var questionsByTopic = s.Questions.GroupBy(q => q.TopicId).ToDictionary(g => g.Key, g => g.Count());

        var opportunities = new List<Opportunity>();
        opportunities.AddRange(TopicOpportunities(s, categoryOf, passedLevels));
        opportunities.AddRange(VideoOpportunities(s, topics, categoryOf, passedLevels));
        opportunities.AddRange(QuizOpportunities(s, topics, categoryOf, questionsByTopic));
        opportunities.AddRange(InterviewOpportunities(s, topics));
        opportunities.AddRange(ExerciseOpportunities(s, topics, categoryOf));
        opportunities.AddRange(ProjectOpportunities(s, topics, categoryOf));
        opportunities.AddRange(DiscussionOpportunities(s));
        opportunities.AddRange(ReviewGivenOpportunities(s));
        opportunities = ApplyDailyCap(opportunities);

        var categories = rules.Categories
            .Select(c =>
            {
                var mine = opportunities.Where(o => o.Categories.Contains(c.Key)).ToList();
                var (score, evidence) = Score(mine);
                return new CategoryScore(c.Key, c.Weight, score, evidence, mine.Sum(o => o.Points), mine.Sum(o => o.MaxPoints));
            })
            .ToList();
        var scored = categories.Where(c => c.MaxPoints > 0).ToList();
        var overall = Round(scored.Sum(c => c.Weight) <= 0 ? 0 : scored.Sum(c => c.Score * c.Weight) / scored.Sum(c => c.Weight));

        var accuracyBySkill = Accuracy(s, topics);
        var technologies = Enum.GetValues<SkillArea>()
            .Select(skill => Technology(skill, s, opportunities, accuracyBySkill))
            .Where(t => t.Evidence.Any(e => e.MaxPoints > 0))
            .ToList();

        var xp = opportunities.Sum(o => o.Points);
        var projectTasksDone = s.Projects.Sum(p => p.Tasks.Count(t => t.Done));
        var projectsCompleted = s.Projects.Count(p => p.IsComplete);
        var advancedCompleted = s.Projects.Count(p => p.IsComplete && SizeOf(p) == ProjectSize.Advanced);
        var byKey = categories.ToDictionary(c => c.Key);

        var levels = rules.Levels.Select((l, i) =>
        {
            var reqs = new List<Requirement> { Req("xp", null, xp, l.MinXp), Req("overall", null, overall, l.MinOverall) };
            reqs.AddRange(l.Categories.Select(kv => Req("category", kv.Key, byKey.TryGetValue(kv.Key, out var c) ? c.Score : 0, kv.Value)));
            if (l.MinProjectTasks > 0) reqs.Add(Req("projectTasks", null, projectTasksDone, l.MinProjectTasks));
            if (l.MinProjectsCompleted > 0) reqs.Add(Req("projectsCompleted", null, projectsCompleted, l.MinProjectsCompleted));
            if (l.MinAdvancedProjects > 0) reqs.Add(Req("advancedProjects", null, advancedCompleted, l.MinAdvancedProjects));
            return new LevelStatus(l.Key, i, l.MinXp, reqs.All(r => r.Met), reqs);
        }).ToList();

        // A level counts only when it and every level below it are met.
        var levelIndex = 0;
        for (var i = 1; i < levels.Count && levels[i].Met && levels.Take(i).All(l => l.Met); i++) levelIndex = i;
        var xpLevelIndex = rules.Levels.FindLastIndex(l => xp >= l.MinXp);
        var next = levelIndex + 1 < levels.Count ? levels[levelIndex + 1] : null;
        var progress = next is null ? 100 : Round(next.Requirements.Average(r => r.Required <= 0 ? 1 : Math.Min(1, r.Current / r.Required)) * 100);

        var weakCategories = scored.Where(c => c.Score < rules.WeakThreshold).OrderBy(c => c.Score).Select(c => c.Key).ToList();
        var context = new Context(s, topics, categoryOf, passedLevels, questionsByTopic, opportunities, categories);

        var stats = new SkillStats(
            s.WatchedVideos.Count,
            s.Attempts.Sum(a => a.Total), s.Attempts.Sum(a => a.Score),
            s.Attempts.Sum(a => a.Total) == 0 ? null : Round(100.0 * s.Attempts.Sum(a => a.Score) / s.Attempts.Sum(a => a.Total)),
            s.Attempts.Count,
            s.Topics.Count(t => t.IsDone), s.Exercises.Count(e => e.Status == PracticeStatus.Completed),
            projectTasksDone, projectsCompleted, Math.Round(s.StudyMinutes / 60.0, 1),
            technologies.Count(t => t.Score >= 80),
            opportunities.Where(o => o.Verification != VerificationTier.SelfReported).Sum(o => o.Points),
            opportunities.Where(o => o.Verification == VerificationTier.SelfReported).Sum(o => o.Points));

        return new SkillResult(
            xp, opportunities.Sum(o => o.MaxPoints), overall, rules.Levels[levelIndex].Key, levelIndex, rules.Levels[xpLevelIndex].Key,
            progress, levels, categories, technologies, opportunities, stats, weakCategories, WeakTopics(s, topics, categoryOf),
            next is null ? [] : NextLevel(next, context), Assessment(context, now));
    }

    // ------------------------------------------------------------------ evidence → opportunities

    private IEnumerable<Opportunity> TopicOpportunities(SkillSnapshot s, Dictionary<int, string> categoryOf, HashSet<(int, int)> passed)
    {
        foreach (var t in s.Topics)
        {
            var max = rules.Points.Topic.GetValueOrDefault(TaskDifficultyOf(t));
            var tier = passed.Contains((t.Id, 1)) ? VerificationTier.QuizVerified : VerificationTier.SelfReported;
            var points = t.IsDone ? Pts(max, tier) : 0;
            yield return new Opportunity($"topic:{t.Id}", XpActivity.TopicCompleted, EvidenceKind.Passive, tier, points, max,
                [categoryOf[t.Id]], [t.Skill], t.CompletedAt ?? t.UpdatedAt, t.TitleEn, t.TitleAr, new ItemRef("topic", t.Id));
        }
    }

    private IEnumerable<Opportunity> VideoOpportunities(SkillSnapshot s, Dictionary<int, TopicFact> topics,
        Dictionary<int, string> categoryOf, HashSet<(int, int)> passed)
    {
        var v = rules.Points.Video;
        var watchedByTopic = s.WatchedVideos.Where(w => topics.ContainsKey(w.TopicId)).ToLookup(w => w.TopicId);
        foreach (var t in s.Topics)
        {
            var watched = watchedByTopic[t.Id].OrderBy(w => w.UpdatedAt).ThenBy(w => w.VideoId, StringComparer.Ordinal).ToList();
            var slots = Math.Min(v.MaxVideosPerTopic, Math.Max(s.CuratedVideosPerTopic.GetValueOrDefault(t.Id), watched.Count));
            var assessed = passed.Contains((t.Id, 1));
            var noted = s.LongestNotePerTopic.GetValueOrDefault(t.Id) >= v.MinNoteCharacters;
            var (value, tier) = assessed ? (v.WatchedAndAssessed, VerificationTier.QuizVerified)
                : noted ? (v.WatchedWithNotes, VerificationTier.Evidenced) : (v.Watched, VerificationTier.SelfReported);
            for (var i = 0; i < watched.Count; i++)
            {
                // Only the first few videos of a topic count: watching more of the same material earns nothing extra.
                var counts = i < v.MaxVideosPerTopic;
                yield return new Opportunity($"video:{watched[i].VideoId}", XpActivity.VideoWatched, EvidenceKind.Passive, tier,
                    counts ? value : 0, counts ? v.WatchedAndAssessed : 0, [categoryOf[t.Id]], [t.Skill], watched[i].UpdatedAt,
                    t.TitleEn, t.TitleAr, new ItemRef("topic", t.Id));
            }
            for (var i = watched.Count; i < slots; i++)
                yield return new Opportunity($"video-slot:{t.Id}:{i}", XpActivity.VideoWatched, EvidenceKind.Passive, VerificationTier.SelfReported,
                    0, v.WatchedAndAssessed, [categoryOf[t.Id]], [t.Skill], null, t.TitleEn, t.TitleAr, new ItemRef("topic", t.Id));
        }
    }

    private IEnumerable<Opportunity> QuizOpportunities(SkillSnapshot s, Dictionary<int, TopicFact> topics,
        Dictionary<int, string> categoryOf, Dictionary<int, int> questionsByTopic)
    {
        var answersByQuestion = s.Answers.ToLookup(a => a.QuestionId);
        var correctByTopic = new Dictionary<int, int>();
        foreach (var q in s.Questions)
        {
            if (!topics.TryGetValue(q.TopicId, out var t)) continue;
            var value = rules.Points.Question.GetValueOrDefault(QuestionDifficultyOf(t));
            var answers = answersByQuestion[q.Id].OrderBy(a => a.At).ToList();
            var firstCorrect = answers.FindIndex(a => a.IsCorrect);
            var points = 0;
            DateTime? at = null;
            if (firstCorrect >= 0)
            {
                // Every question earns once. Many wrong tries before the first right answer reduce it.
                var factor = firstCorrect >= rules.Points.QuizRetryPenalty.FreeAttempts ? rules.Points.QuizRetryPenalty.Factor : 1;
                points = (int)Math.Round(value * factor);
                at = answers[firstCorrect].At;
                correctByTopic[t.Id] = correctByTopic.GetValueOrDefault(t.Id) + 1;
            }
            yield return new Opportunity($"quiz-q:{q.Id}", XpActivity.QuizQuestion, EvidenceKind.Knowledge, VerificationTier.QuizVerified,
                points, value, [categoryOf[t.Id]], [t.Skill], at, t.TitleEn, t.TitleAr, new ItemRef("topic", t.Id, 1));
        }

        // Attempts saved before answers were recorded one by one: their best level-1 score still counts, without
        // counting a question twice once it is answered again.
        foreach (var g in s.Attempts.Where(a => !a.HasAnswers && a.Level == 1 && topics.ContainsKey(a.TopicId)).GroupBy(a => a.TopicId))
        {
            var t = topics[g.Key];
            var best = g.OrderByDescending(a => a.Score).ThenBy(a => a.At).First();
            var count = Math.Max(0, Math.Min(best.Score, questionsByTopic.GetValueOrDefault(t.Id)) - correctByTopic.GetValueOrDefault(t.Id));
            var value = rules.Points.Question.GetValueOrDefault(QuestionDifficultyOf(t));
            yield return new Opportunity($"quiz-legacy:{t.Id}", XpActivity.QuizQuestion, EvidenceKind.Knowledge, VerificationTier.QuizVerified,
                count * value, 0, [categoryOf[t.Id]], [t.Skill], best.At, t.TitleEn, t.TitleAr, new ItemRef("topic", t.Id, 1));
        }

        // Passing the review levels shows the topic is retained alongside the ones before it.
        foreach (var t in s.Topics)
        {
            if (questionsByTopic.GetValueOrDefault(t.Id) == 0) continue;
            foreach (var (level, value) in rules.Points.QuizLevelPass)
            {
                if (t.Position < (level == 2 ? 1 : 4)) continue;   // QuizService only offers these levels after earlier topics
                var pass = s.Attempts.Where(a => a.TopicId == t.Id && a.Level == level && a.Passed).OrderBy(a => a.At).FirstOrDefault();
                yield return new Opportunity($"quiz-level:{t.Id}:{level}", XpActivity.QuizLevelPassed, EvidenceKind.Knowledge,
                    VerificationTier.QuizVerified, pass is null ? 0 : value, value, [categoryOf[t.Id]], [t.Skill], pass?.At,
                    t.TitleEn, t.TitleAr, new ItemRef("topic", t.Id, level));
            }
        }
    }

    private IEnumerable<Opportunity> InterviewOpportunities(SkillSnapshot s, Dictionary<int, TopicFact> topics)
    {
        foreach (var q in s.Interviews)
        {
            if (!rules.InterviewCategories.TryGetValue(q.Category, out var category)) continue;
            var value = rules.Points.Interview.GetValueOrDefault(q.Difficulty);
            var share = q.Rating switch
            {
                InterviewRating.Confident => 1,
                InterviewRating.Partial => rules.Points.InterviewPartialFactor,
                _ => 0,
            };
            SkillArea[] skills = topics.TryGetValue(q.TopicId, out var t) ? [t.Skill] : [];
            yield return new Opportunity($"interview:{q.Id}", XpActivity.InterviewQuestion, EvidenceKind.Knowledge, VerificationTier.SelfReported,
                Pts(value * share, VerificationTier.SelfReported), value, [category], skills, q.At, t?.TitleEn ?? "", t?.TitleAr ?? "", null);
        }
    }

    private IEnumerable<Opportunity> ExerciseOpportunities(SkillSnapshot s, Dictionary<int, TopicFact> topics, Dictionary<int, string> categoryOf)
    {
        var p = rules.Points;
        foreach (var e in s.Exercises)
        {
            if (!topics.TryGetValue(e.TopicId, out var t)) continue;
            var categories = new List<string> { categoryOf[t.Id] };
            if (rules.ExerciseExtraCategories.TryGetValue(e.Type, out var extra)) categories.Add(extra);
            categories.AddRange(e.Technologies.Select(rules.CategoryOfSkill).OfType<string>());
            var skills = e.Technologies.Prepend(t.Skill).Distinct().ToList();
            var max = p.Exercise.GetValueOrDefault(SizeOf(e));
            var allCriteria = e.CriteriaTotal > 0 && e.CriteriaChecked >= e.CriteriaTotal;
            var tier = e.HasChecks && e.BestScore == 100 ? VerificationTier.AutoChecked
                : e.WroteAnswer || allCriteria ? VerificationTier.Evidenced : VerificationTier.SelfReported;
            var done = e.Status == PracticeStatus.Completed;

            var factor = 1.0 - Math.Min(p.ExerciseMaxHintPenalty, e.HintsRevealed * p.ExerciseHintPenalty);
            if (e.SolutionRevealed) factor *= p.ExerciseSolutionFactor;
            var cats = categories.Distinct().ToList();
            yield return new Opportunity($"exercise:{e.Id}", XpActivity.ExerciseCompleted, EvidenceKind.Practical, tier,
                done ? Pts(max * factor, tier) : 0, max, cats, skills, e.CompletedAt, e.TitleEn, e.TitleAr, new ItemRef("exercise", e.Id));

            // Quality: solved without the model solution, and meeting the acceptance criteria or the automatic checks.
            var qualityMax = (int)Math.Round(max * p.ExerciseQualityShare);
            var met = tier == VerificationTier.AutoChecked ? 1.0 : e.CriteriaTotal > 0 ? (double)e.CriteriaChecked / e.CriteriaTotal : e.WroteAnswer ? 0.5 : 0;
            var quality = done && !e.SolutionRevealed ? Pts(qualityMax * met, tier) : 0;
            yield return new Opportunity($"exercise-quality:{e.Id}", XpActivity.ExerciseQuality, EvidenceKind.Quality, tier,
                quality, qualityMax, cats, skills, e.CompletedAt, e.TitleEn, e.TitleAr, new ItemRef("exercise", e.Id));
        }
    }

    private IEnumerable<Opportunity> ProjectOpportunities(SkillSnapshot s, Dictionary<int, TopicFact> topics, Dictionary<int, string> categoryOf)
    {
        var p = rules.Points;
        foreach (var project in s.Projects)
        {
            var size = SizeOf(project);
            var tier = project.HasRepository ? VerificationTier.Evidenced : VerificationTier.SelfReported;
            var projectSkills = new HashSet<SkillArea>();
            foreach (var task in project.Tasks)
            {
                var linked = task.TopicIds.Where(topics.ContainsKey).ToList();
                var skills = linked.Select(id => topics[id].Skill).Distinct().ToList();
                projectSkills.UnionWith(skills);
                var max = p.ProjectTask.GetValueOrDefault(task.Minutes <= p.ProjectTaskBands.SmallMaxMinutes ? ProjectTaskSize.Small
                    : task.Minutes <= p.ProjectTaskBands.MediumMaxMinutes ? ProjectTaskSize.Medium : ProjectTaskSize.Complex);
                yield return new Opportunity($"project-task:{task.Id}", XpActivity.ProjectTaskCompleted, EvidenceKind.Project, tier,
                    task.Done ? Pts(max, tier) : 0, max, linked.Select(id => categoryOf[id]).Prepend("projects").Distinct().ToList(), skills,
                    task.CompletedAt, task.TitleEn, task.TitleAr, new ItemRef("project", project.Id));
            }

            // The completion bonus needs every required task: it is never paid for part of a project, and it is a
            // separate source from the tasks, so nothing is counted twice.
            var bonus = p.ProjectCompletion.GetValueOrDefault(size);
            var completedAt = project.IsComplete ? project.Tasks.Where(t => !t.IsChangeRequest).Max(t => t.CompletedAt) : null;
            yield return new Opportunity($"project:{project.Id}", XpActivity.ProjectCompleted, EvidenceKind.Project, tier,
                project.IsComplete ? Pts(bonus, tier) : 0, bonus, ["projects"], projectSkills.ToList(), completedAt,
                project.TitleEn, project.TitleAr, new ItemRef("project", project.Id));

            // The rubric review counts once the project is finished.
            var reviewMax = rules.ReviewCriteria.Count == 0 ? 0 : (double)p.ProjectReview.GetValueOrDefault(size) / rules.ReviewCriteria.Count;
            var reviewTier = project.Review?.Verification == VerificationTier.Reviewed ? VerificationTier.Reviewed : tier;
            foreach (var c in rules.ReviewCriteria)
            {
                var score = project.Review?.Scores.GetValueOrDefault(c.Key) ?? 0;
                var points = project.IsComplete && project.Review is not null ? Pts(reviewMax * Math.Clamp(score, 0, 4) / 4.0, reviewTier) : 0;
                yield return new Opportunity($"project-review:{project.Id}:{c.Key}", XpActivity.ProjectReview, EvidenceKind.Quality, reviewTier,
                    points, (int)Math.Round(reviewMax), new[] { c.Category, "projects" }.Distinct().ToList(), projectSkills.ToList(),
                    project.Review?.UpdatedAt, project.TitleEn, project.TitleAr, new ItemRef("project", project.Id));
            }

            var portfolioMax = p.PortfolioItem * project.PortfolioItemsTotal;
            yield return new Opportunity($"portfolio:{project.Id}", XpActivity.PortfolioItem, EvidenceKind.Quality, tier,
                Pts(p.PortfolioItem * project.PortfolioItemsDone, tier), portfolioMax, ["projects"], [], null,
                project.TitleEn, project.TitleAr, new ItemRef("project", project.Id));
        }
    }

    /// <summary>
    /// Accepted answers add XP only. They carry no category or technology: they exist only once earned, so counting
    /// them in a competency score would raise its earned and available points together and inflate it.
    /// </summary>
    private IEnumerable<Opportunity> DiscussionOpportunities(SkillSnapshot s)
    {
        var p = rules.Points;
        foreach (var a in (s.AcceptedAnswers ?? []).OrderBy(a => a.At).ThenBy(a => a.ReplyId).Take(p.DiscussionAcceptedCap))
            yield return new Opportunity($"discussion-accept:{a.ReplyId}", XpActivity.DiscussionAnswerAccepted, EvidenceKind.Knowledge,
                VerificationTier.Reviewed, Pts(p.DiscussionAccepted, VerificationTier.Reviewed), p.DiscussionAccepted, [], [],
                a.At, a.TitleEn, a.TitleAr, null);
    }

    /// <summary>Reviewing someone else's project adds XP only, like accepted answers (see above).</summary>
    private IEnumerable<Opportunity> ReviewGivenOpportunities(SkillSnapshot s)
    {
        var p = rules.Points;
        foreach (var r in (s.ReviewsGiven ?? []).OrderBy(r => r.At).ThenBy(r => r.RequestId).Take(p.PeerReviewGivenCap))
            yield return new Opportunity($"review-given:{r.RequestId}", XpActivity.ProjectReviewGiven, EvidenceKind.Quality,
                VerificationTier.Evidenced, Pts(p.PeerReviewGiven, VerificationTier.Evidenced), p.PeerReviewGiven, [], [],
                r.At, r.ProjectTitleEn, r.ProjectTitleAr, null);
    }

    /// <summary>Limits self-reported points per day, so ticking a whole phase at once can't flood the score.</summary>
    private List<Opportunity> ApplyDailyCap(List<Opportunity> all)
    {
        var cap = rules.Points.SelfReportedDailyCap;
        if (cap <= 0) return all;
        var result = all.ToDictionary(o => o.Key);
        foreach (var day in all.Where(o => o.Verification == VerificationTier.SelfReported && o.Points > 0)
                     .GroupBy(o => o.OccurredAt?.Date ?? DateTime.MinValue))
        {
            var left = cap;
            foreach (var o in day.OrderBy(o => o.OccurredAt).ThenBy(o => o.Key, StringComparer.Ordinal))
            {
                var kept = Math.Min(o.Points, left);
                left -= kept;
                if (kept < o.Points) result[o.Key] = o with { Points = kept, CappedPoints = o.Points - kept };
            }
        }
        return all.Select(o => result[o.Key]).ToList();
    }

    // ------------------------------------------------------------------ scores

    private (double Score, List<EvidenceScore> Evidence) Score(IReadOnlyCollection<Opportunity> items)
    {
        var evidence = Enum.GetValues<EvidenceKind>().Select(k =>
        {
            var of = items.Where(o => o.Evidence == k).ToList();
            var max = of.Sum(o => o.MaxPoints);
            var points = of.Sum(o => o.Points);
            return new EvidenceScore(k, max <= 0 ? 0 : Round(Math.Min(100, 100.0 * points / max)), points, max);
        }).ToList();
        // Evidence kinds a category has no content for don't count against it: their weight moves to the others.
        var weighed = evidence.Where(e => e.MaxPoints > 0).ToList();
        var weights = weighed.Sum(e => rules.EvidenceWeights.GetValueOrDefault(e.Kind));
        var score = weights <= 0 ? 0 : Round(weighed.Sum(e => e.Score * rules.EvidenceWeights.GetValueOrDefault(e.Kind)) / weights);
        return (score, evidence);
    }

    private TechnologyScore Technology(SkillArea skill, SkillSnapshot s, List<Opportunity> all,
        Dictionary<SkillArea, (int Answered, int Correct)> accuracy)
    {
        var mine = all.Where(o => o.Skills.Contains(skill)).ToList();
        var (score, evidence) = Score(mine);
        var topicIds = s.Topics.Where(t => t.Skill == skill).Select(t => t.Id).ToHashSet();
        var acc = accuracy.GetValueOrDefault(skill);
        return new TechnologyScore(skill, score, evidence, mine.Sum(o => o.Points),
            s.Topics.Count(t => t.Skill == skill && t.IsDone), topicIds.Count,
            s.Exercises.Count(e => e.Status == PracticeStatus.Completed && (topicIds.Contains(e.TopicId) || e.Technologies.Contains(skill))),
            s.Projects.Sum(p => p.Tasks.Count(t => t.Done && t.TopicIds.Any(topicIds.Contains))),
            acc.Answered, acc.Answered == 0 ? null : Round(100.0 * acc.Correct / acc.Answered), Proficiency(score));
    }

    /// <summary>Answers per technology: recorded answers, plus level-1 attempts saved before answers were recorded.</summary>
    private static Dictionary<SkillArea, (int Answered, int Correct)> Accuracy(SkillSnapshot s, Dictionary<int, TopicFact> topics)
    {
        var topicOfQuestion = s.Questions.ToDictionary(q => q.Id, q => q.TopicId);
        var result = new Dictionary<SkillArea, (int, int)>();
        void Add(int topicId, int answered, int correct)
        {
            if (!topics.TryGetValue(topicId, out var t)) return;
            var (a, c) = result.GetValueOrDefault(t.Skill);
            result[t.Skill] = (a + answered, c + correct);
        }
        foreach (var a in s.Answers)
            if (topicOfQuestion.TryGetValue(a.QuestionId, out var topicId)) Add(topicId, 1, a.IsCorrect ? 1 : 0);
        foreach (var a in s.Attempts.Where(a => !a.HasAnswers && a.Level == 1)) Add(a.TopicId, a.Total, a.Score);
        return result;
    }

    private static List<WeakTopic> WeakTopics(SkillSnapshot s, Dictionary<int, TopicFact> topics, Dictionary<int, string> categoryOf)
    {
        var topicOfQuestion = s.Questions.ToDictionary(q => q.Id, q => q.TopicId);
        var byTopic = new Dictionary<int, (int Answered, int Correct)>();
        foreach (var a in s.Answers)
        {
            if (!topicOfQuestion.TryGetValue(a.QuestionId, out var id)) continue;
            var (n, c) = byTopic.GetValueOrDefault(id);
            byTopic[id] = (n + 1, c + (a.IsCorrect ? 1 : 0));
        }
        foreach (var a in s.Attempts.Where(a => !a.HasAnswers && a.Level == 1))
        {
            var (n, c) = byTopic.GetValueOrDefault(a.TopicId);
            byTopic[a.TopicId] = (n + a.Total, c + a.Score);
        }
        return byTopic.Where(kv => topics.ContainsKey(kv.Key) && kv.Value.Answered >= WeakTopicMinAnswers)
            .Select(kv => (Topic: topics[kv.Key], kv.Value.Answered, kv.Value.Correct, Acc: Round(100.0 * kv.Value.Correct / kv.Value.Answered)))
            .Where(x => x.Acc < WeakTopicAccuracy)
            .OrderBy(x => x.Acc).ThenBy(x => x.Topic.Position)
            .Take(8)
            .Select(x => new WeakTopic(x.Topic.Id, x.Topic.TitleEn, x.Topic.TitleAr, categoryOf[x.Topic.Id], x.Answered, x.Correct, x.Acc))
            .ToList();
    }

    // ------------------------------------------------------------------ what to do next

    private sealed record Context(
        SkillSnapshot S, Dictionary<int, TopicFact> Topics, Dictionary<int, string> CategoryOf, HashSet<(int, int)> Passed,
        Dictionary<int, int> QuestionsByTopic, List<Opportunity> Opportunities, List<CategoryScore> Categories);

    private List<NextLevelRequirement> NextLevel(LevelStatus next, Context c) =>
        next.Requirements.Where(r => !r.Met).Select(r => new NextLevelRequirement(r, r.Code switch
        {
            "category" => CategoryActions(r.Category!, c, 3),
            "overall" => c.Categories.Where(x => x.MaxPoints > 0).OrderBy(x => x.Score).Take(2)
                .SelectMany(x => CategoryActions(x.Key, c, 1)).ToList(),
            "projectTasks" or "projectsCompleted" => ProjectActions(c, advancedOnly: false),
            "advancedProjects" => ProjectActions(c, advancedOnly: true),
            "xp" => [new Recommendation("earnXp", null, null, null, null, r.Required - r.Current)],
            _ => [],
        })).ToList();

    /// <summary>Actions for the category's weakest kind of evidence first: quizzes for knowledge, exercises for practice ...</summary>
    private List<Recommendation> CategoryActions(string category, Context c, int take)
    {
        var score = c.Categories.First(x => x.Key == category);
        var actions = new List<Recommendation>();
        foreach (var kind in score.Evidence.Where(e => e.MaxPoints > 0).OrderBy(e => e.Score).ThenByDescending(e => rules.EvidenceWeights.GetValueOrDefault(e.Kind)))
        {
            actions.AddRange(ActionsFor(kind.Kind, category, c).Take(take - actions.Count));
            if (actions.Count >= take) break;
        }
        return actions;
    }

    private IEnumerable<Recommendation> ActionsFor(EvidenceKind kind, string category, Context c)
    {
        var inCategory = c.S.Topics.Where(t => c.CategoryOf[t.Id] == category).OrderBy(t => t.Position).ToList();
        switch (kind)
        {
            case EvidenceKind.Knowledge:
                foreach (var t in inCategory.Where(t => c.QuestionsByTopic.GetValueOrDefault(t.Id) > 0))
                {
                    var level = new[] { 1, 2, 3 }.FirstOrDefault(l => !c.Passed.Contains((t.Id, l)) && (l == 1 || c.Passed.Contains((t.Id, l - 1))));
                    if (level == 0 || (level == 2 && t.Position < 1) || (level == 3 && t.Position < 4)) continue;
                    yield return new Recommendation(level == 1 ? "passQuiz" : "passQuizLevel", category, new ItemRef("topic", t.Id, level), t.TitleEn, t.TitleAr);
                }
                break;
            case EvidenceKind.Practical:
            case EvidenceKind.Quality when !c.Opportunities.Any(o => o.Activity == XpActivity.ProjectReview && o.Categories.Contains(category)):
                foreach (var o in c.Opportunities.Where(o => o.Activity == XpActivity.ExerciseCompleted && o.Points == 0 && o.Categories.Contains(category))
                             .OrderBy(o => o.MaxPoints).ThenBy(o => o.Ref!.Id))
                    yield return new Recommendation("doExercise", category, o.Ref, o.TitleEn, o.TitleAr);
                break;
            case EvidenceKind.Project:
                foreach (var o in c.Opportunities.Where(o => o.Activity == XpActivity.ProjectTaskCompleted && o.Points == 0 && o.Categories.Contains(category))
                             .DistinctBy(o => o.Ref!.Id))
                    yield return new Recommendation("doProjectTask", category, o.Ref, o.TitleEn, o.TitleAr);
                break;
            case EvidenceKind.Quality:
                foreach (var p in c.S.Projects.Where(p => p.IsComplete && p.Review is null))
                    yield return new Recommendation("reviewProject", category, new ItemRef("project", p.Id), p.TitleEn, p.TitleAr);
                foreach (var o in c.Opportunities.Where(o => o.Activity == XpActivity.ExerciseQuality && o.Points < o.MaxPoints && o.Categories.Contains(category))
                             .OrderBy(o => o.MaxPoints))
                    yield return new Recommendation("doExercise", category, o.Ref, o.TitleEn, o.TitleAr);
                break;
            case EvidenceKind.Passive:
                foreach (var t in inCategory.Where(t => !t.IsDone))
                    yield return new Recommendation("studyTopic", category, new ItemRef("topic", t.Id), t.TitleEn, t.TitleAr);
                break;
        }
    }

    private List<Recommendation> ProjectActions(Context c, bool advancedOnly)
    {
        var project = c.S.Projects.Where(p => !p.IsComplete && (!advancedOnly || SizeOf(p) == ProjectSize.Advanced)).OrderBy(p => p.Order).FirstOrDefault();
        if (project is null) return [];
        var actions = new List<Recommendation>
        {
            new("finishProject", "projects", new ItemRef("project", project.Id), project.TitleEn, project.TitleAr,
                project.RequiredTotal - project.RequiredDone),
        };
        var task = project.Tasks.FirstOrDefault(t => !t.Done && !t.IsChangeRequest);
        if (task is not null)
            actions.Add(new Recommendation("doProjectTask", "projects", new ItemRef("project", project.Id), task.TitleEn, task.TitleAr));
        return actions;
    }

    /// <summary>
    /// Adaptive skill checks: for each category, checks at the difficulty the learner's score calls for. A weak area gets
    /// a first-level quiz and a basic exercise; a strong one gets the review quizzes and the hardest exercises.
    /// A category whose last quiz evidence is old is flagged for a re-check.
    /// </summary>
    private List<AssessmentItem> Assessment(Context c, DateTime now)
    {
        var items = new List<AssessmentItem>();
        // Looked up per category below; a scan of every opportunity per exercise per category took seconds.
        var exerciseCategories = c.Opportunities.Where(o => o.Activity == XpActivity.ExerciseCompleted && o.Ref is not null)
            .ToDictionary(o => o.Ref!.Id, o => o.Categories);
        var lastQuizByCategory = c.Opportunities
            .Where(o => o.Evidence == EvidenceKind.Knowledge && o.Verification == VerificationTier.QuizVerified && o.Points > 0 && o.OccurredAt is not null)
            .SelectMany(o => o.Categories.Select(cat => (cat, o.OccurredAt!.Value)))
            .GroupBy(x => x.cat).ToDictionary(g => g.Key, g => g.Max(x => x.Value));
        foreach (var score in c.Categories.Where(x => x.MaxPoints > 0).OrderBy(x => x.Score))
        {
            var band = score.Score < rules.WeakThreshold ? "foundation" : score.Score < 70 ? "consolidate" : "stretch";
            var stale = lastQuizByCategory.TryGetValue(score.Key, out var lastQuiz) && (now - lastQuiz).TotalDays > rules.StaleKnowledgeDays;

            var topics = c.S.Topics.Where(t => c.CategoryOf[t.Id] == score.Key && c.QuestionsByTopic.GetValueOrDefault(t.Id) > 0)
                .OrderBy(t => t.Position).ToList();
            var checks = new List<Recommendation>();
            var quizLevel = band switch { "foundation" => 1, "consolidate" => 2, _ => 3 };
            var quizTopic = band == "stretch"
                ? topics.LastOrDefault(t => t.Position >= 4 && !c.Passed.Contains((t.Id, 3)) && c.Passed.Contains((t.Id, 2)))
                : band == "consolidate"
                    ? topics.FirstOrDefault(t => t.Position >= 1 && c.Passed.Contains((t.Id, 1)) && !c.Passed.Contains((t.Id, 2)))
                    : topics.FirstOrDefault(t => !c.Passed.Contains((t.Id, 1)));
            // Fall back to the first quiz not yet passed when the band's quiz isn't open yet.
            if (quizTopic is null)
            {
                quizTopic = topics.FirstOrDefault(t => !c.Passed.Contains((t.Id, 1)));
                quizLevel = 1;
            }
            if (quizTopic is not null)
                checks.Add(new Recommendation("takeQuiz", score.Key, new ItemRef("topic", quizTopic.Id, quizLevel), quizTopic.TitleEn, quizTopic.TitleAr));
            else if (stale && topics.Count > 0)
                checks.Add(new Recommendation("retakeQuiz", score.Key, new ItemRef("topic", topics[^1].Id, 1), topics[^1].TitleEn, topics[^1].TitleAr));

            var wanted = band switch
            {
                "foundation" => new[] { Difficulty.Beginner, Difficulty.Intermediate },
                "consolidate" => [Difficulty.Intermediate, Difficulty.Advanced],
                _ => [Difficulty.Advanced, Difficulty.Expert],
            };
            var exercise = c.S.Exercises
                .Where(e => e.Status != PracticeStatus.Completed && wanted.Contains(e.Difficulty))
                .Where(e => exerciseCategories.TryGetValue(e.Id, out var cats) && cats.Contains(score.Key))
                .OrderBy(e => Array.IndexOf(wanted, e.Difficulty))
                .ThenByDescending(e => e.Type is ExerciseType.Debugging or ExerciseType.Scenario or ExerciseType.Challenge)
                .ThenBy(e => e.Id)
                .FirstOrDefault();
            if (exercise is not null)
                checks.Add(new Recommendation(ExerciseCheckCode(exercise.Type), score.Key, new ItemRef("exercise", exercise.Id), exercise.TitleEn, exercise.TitleAr));

            if (checks.Count > 0) items.Add(new AssessmentItem(score.Key, band, stale, checks));
        }
        return items;
    }

    private static string ExerciseCheckCode(ExerciseType type) => type switch
    {
        ExerciseType.Debugging => "debuggingChallenge",
        ExerciseType.Scenario => "architectureScenario",
        ExerciseType.CodeReview => "codeReviewCheck",
        ExerciseType.Challenge or ExerciseType.MiniProject or ExerciseType.FullStack => "implementationTask",
        _ => "codingExercise",
    };

    // ------------------------------------------------------------------ helpers

    public Difficulty DifficultyOf(TopicFact t) =>
        t.Difficulty ?? rules.PhaseDifficulty.GetValueOrDefault(t.PhaseSlug, Difficulty.Intermediate);

    public TaskDifficulty TaskDifficultyOf(TopicFact t) => DifficultyOf(t) switch
    {
        Difficulty.Beginner => t.Priority == TopicPriority.Optional ? TaskDifficulty.VeryEasy : TaskDifficulty.Easy,
        Difficulty.Intermediate => TaskDifficulty.Medium,
        Difficulty.Advanced => TaskDifficulty.Hard,
        _ => TaskDifficulty.Advanced,
    };

    public QuestionDifficulty QuestionDifficultyOf(TopicFact t) => DifficultyOf(t) switch
    {
        Difficulty.Beginner => QuestionDifficulty.Easy,
        Difficulty.Intermediate => QuestionDifficulty.Medium,
        Difficulty.Advanced => QuestionDifficulty.Hard,
        _ => QuestionDifficulty.Advanced,
    };

    public static ExerciseSize SizeOf(ExerciseFact e) => e.Difficulty switch
    {
        Difficulty.Beginner => ExerciseSize.Basic,
        Difficulty.Intermediate => ExerciseSize.Intermediate,
        Difficulty.Advanced when e.Type is ExerciseType.Challenge or ExerciseType.MiniProject => ExerciseSize.Complex,
        Difficulty.Advanced => ExerciseSize.Advanced,
        _ => ExerciseSize.Complex,
    };

    public ProjectSize SizeOf(ProjectFact p) =>
        rules.ProjectSizes.TryGetValue(p.Slug, out var size) ? size
        : p.RequiredTotal >= 20 ? ProjectSize.Advanced : p.RequiredTotal >= 15 ? ProjectSize.Medium : ProjectSize.Small;

    public static string Proficiency(double score) => score switch
    {
        < 20 => "novice",
        < 40 => "foundational",
        < 60 => "working",
        < 80 => "proficient",
        _ => "advanced",
    };

    private int Pts(double value, VerificationTier tier) => (int)Math.Round(value * rules.Factor(tier), MidpointRounding.AwayFromZero);

    private static Requirement Req(string code, string? category, double current, double required) =>
        new(code, category, Math.Round(current, 1), required, current >= required);

    private static double Round(double v) => Math.Round(v, 1);
}
