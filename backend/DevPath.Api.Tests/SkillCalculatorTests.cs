using DevPath.Api.Models;
using DevPath.Api.Services.Skills;

namespace DevPath.Api.Tests;

/// <summary>
/// The scoring rules, on small hand-made snapshots. Uses the real SeedData/skill-assessment.json so the tests
/// also catch a rules file that no longer makes sense.
/// </summary>
public class SkillCalculatorTests
{
    private static readonly SkillRules Rules = SkillRules.Load();
    private static readonly DateTime Now = new(2026, 11, 7, 12, 0, 0, DateTimeKind.Utc);
    private readonly SkillCalculator _calc = new(Rules);

    // A tiny roadmap: two fundamentals topics (Beginner), one SQL topic (Intermediate), one testing topic.
    private static List<TopicFact> Topics(params (int Id, TopicStatus Status)[] progress)
    {
        var status = progress.ToDictionary(p => p.Id, p => p.Status);
        TopicFact T(int id, string slug, string phase, SkillArea skill) => new(id, slug, phase, id - 1, skill, TopicPriority.Core, null, 60,
            slug, slug, status.GetValueOrDefault(id), status.ContainsKey(id) ? Now.AddDays(-id) : null, null);
        return
        [
            T(1, "cs-variables-types", "csharp-fundamentals", SkillArea.CSharp),
            T(2, "cs-loops", "csharp-fundamentals", SkillArea.CSharp),
            T(3, "sql-indexing", "sql-server-for-dotnet", SkillArea.SqlServer),
            T(4, "test-unit-csharp", "testing", SkillArea.Testing),
            T(5, "cs-methods", "csharp-fundamentals", SkillArea.CSharp),
        ];
    }

    private static SkillSnapshot Snapshot(
        List<TopicFact>? topics = null, List<AnswerFact>? answers = null, List<AttemptFact>? attempts = null,
        List<ExerciseFact>? exercises = null, List<ProjectFact>? projects = null, List<VideoFact>? videos = null,
        List<InterviewFact>? interviews = null, Dictionary<int, int>? notes = null) => new(
        topics ?? Topics(), videos ?? [], new Dictionary<int, int> { [1] = 4, [2] = 4, [3] = 4, [4] = 4, [5] = 4 }, notes ?? [],
        // Three questions per topic: ids 10..12 for topic 1, 20..22 for topic 2 ...
        Enumerable.Range(1, 5).SelectMany(t => Enumerable.Range(0, 3).Select(i => new QuestionFact(t * 10 + i, t))).ToList(),
        answers ?? [], attempts ?? [], interviews ?? [], exercises ?? [], projects ?? [], 0);

    private static Opportunity Opp(SkillResult r, string key) => r.Opportunities.Single(o => o.Key == key);

    [Fact]
    public void A_new_learner_is_a_beginner_with_no_points()
    {
        var r = _calc.Calculate(Snapshot(), Now);
        Assert.Equal(0, r.Xp);
        Assert.Equal("beginner", r.Level);
        Assert.Equal(0, r.Overall);
        Assert.All(r.Opportunities, o => Assert.Equal(0, o.Points));
        Assert.True(r.MaxXp > 0);
    }

    [Fact]
    public void A_question_earns_once_however_often_it_is_answered_correctly()
    {
        var answers = new List<AnswerFact>
        {
            new(10, true, Now.AddHours(-3)), new(10, true, Now.AddHours(-2)), new(10, true, Now.AddHours(-1)),
            new(11, false, Now.AddHours(-1)),
        };
        var r = _calc.Calculate(Snapshot(answers: answers), Now);
        Assert.Equal(Rules.Points.Question[QuestionDifficulty.Easy], Opp(r, "quiz-q:10").Points);
        Assert.Equal(0, Opp(r, "quiz-q:11").Points);   // wrong answers give nothing
        Assert.Equal(Now.AddHours(-3), Opp(r, "quiz-q:10").OccurredAt);
    }

    [Fact]
    public void Many_wrong_tries_before_the_right_answer_reduce_a_question()
    {
        var wrong = Enumerable.Range(0, Rules.Points.QuizRetryPenalty.FreeAttempts).Select(i => new AnswerFact(10, false, Now.AddMinutes(i)));
        var r = _calc.Calculate(Snapshot(answers: [.. wrong, new AnswerFact(10, true, Now.AddHours(1))]), Now);
        var full = Rules.Points.Question[QuestionDifficulty.Easy];
        Assert.Equal((int)Math.Round(full * Rules.Points.QuizRetryPenalty.Factor), Opp(r, "quiz-q:10").Points);
    }

    [Fact]
    public void Question_value_follows_the_topic_difficulty()
    {
        var r = _calc.Calculate(Snapshot(answers: [new(10, true, Now), new(30, true, Now)]), Now);
        Assert.Equal(Rules.Points.Question[QuestionDifficulty.Easy], Opp(r, "quiz-q:10").Points);    // fundamentals: Beginner
        Assert.Equal(Rules.Points.Question[QuestionDifficulty.Medium], Opp(r, "quiz-q:30").Points);  // SQL: Intermediate
    }

    [Fact]
    public void Old_attempts_without_answers_count_without_double_counting_new_answers()
    {
        var attempts = new List<AttemptFact> { new(1, 1, 3, 3, Now.AddDays(-30), HasAnswers: false) };
        var easy = Rules.Points.Question[QuestionDifficulty.Easy];
        var before = _calc.Calculate(Snapshot(attempts: attempts), Now);
        Assert.Equal(3 * easy, Opp(before, "quiz-legacy:1").Points);

        // Answering two of the same questions again moves their points to the per-question sources; the total stays the same.
        var after = _calc.Calculate(Snapshot(attempts: attempts, answers: [new(10, true, Now), new(11, true, Now)]), Now);
        Assert.Equal(easy, Opp(after, "quiz-legacy:1").Points);
        Assert.Equal(before.Opportunities.Where(o => o.Evidence == EvidenceKind.Knowledge).Sum(o => o.Points),
            after.Opportunities.Where(o => o.Evidence == EvidenceKind.Knowledge).Sum(o => o.Points));
    }

    [Fact]
    public void A_self_reported_topic_earns_less_than_one_checked_by_a_quiz()
    {
        var topics = Topics((1, TopicStatus.Completed), (2, TopicStatus.Completed));
        var r = _calc.Calculate(Snapshot(topics: topics, attempts: [new(2, 1, 3, 3, Now, true)]), Now);
        var full = Rules.Points.Topic[TaskDifficulty.Easy];
        Assert.Equal(VerificationTier.SelfReported, Opp(r, "topic:1").Verification);
        Assert.Equal((int)Math.Round(full * Rules.Verification[VerificationTier.SelfReported]), Opp(r, "topic:1").Points);
        Assert.Equal(VerificationTier.QuizVerified, Opp(r, "topic:2").Verification);
        Assert.Equal(full, Opp(r, "topic:2").Points);
    }

    [Fact]
    public void Watching_videos_has_limited_value_and_more_videos_of_a_topic_earn_nothing()
    {
        var videos = Enumerable.Range(0, Rules.Points.Video.MaxVideosPerTopic + 2)
            .Select(i => new VideoFact($"vid{i:D8}", 1, Now.AddMinutes(i))).ToList();
        var r = _calc.Calculate(Snapshot(videos: videos), Now);
        var points = r.Opportunities.Where(o => o.Activity == XpActivity.VideoWatched).Sum(o => o.Points);
        Assert.Equal(Rules.Points.Video.MaxVideosPerTopic * Rules.Points.Video.Watched, points);

        // A note on the topic, then a passed quiz, raise each counted video to the higher value.
        var noted = _calc.Calculate(Snapshot(videos: videos, notes: new() { [1] = 500 }), Now);
        Assert.Equal(Rules.Points.Video.WatchedWithNotes, Opp(noted, "video:vid00000000").Points);
        var assessed = _calc.Calculate(Snapshot(videos: videos, attempts: [new(1, 1, 3, 3, Now, true)]), Now);
        Assert.Equal(Rules.Points.Video.WatchedAndAssessed, Opp(assessed, "video:vid00000000").Points);
    }

    private static ExerciseFact Exercise(int id, Difficulty d, PracticeStatus status, bool checks = false, int? best = null,
        int hints = 0, bool solution = false, ExerciseType type = ExerciseType.Coding, int topic = 1) =>
        new(id, topic, type, d, checks, [], $"ex{id}", $"ex{id}", status, best, hints, solution, WroteAnswer: false,
            CriteriaTotal: 3, CriteriaChecked: status == PracticeStatus.Completed ? 3 : 0, Now, ExerciseRunner.CSharp);

    [Fact]
    public void Exercises_are_scored_by_difficulty_verification_and_help_used()
    {
        var r = _calc.Calculate(Snapshot(exercises:
        [
            Exercise(1, Difficulty.Intermediate, PracticeStatus.Completed, checks: true, best: 100),
            Exercise(2, Difficulty.Intermediate, PracticeStatus.Completed),
            Exercise(3, Difficulty.Intermediate, PracticeStatus.Completed, solution: true),
            Exercise(4, Difficulty.Intermediate, PracticeStatus.Completed, hints: 2),
            Exercise(5, Difficulty.Expert, PracticeStatus.Attempted),
        ]), Now);
        var full = Rules.Points.Exercise[ExerciseSize.Intermediate];
        Assert.Equal(VerificationTier.AutoChecked, Opp(r, "exercise:1").Verification);
        Assert.Equal((int)Math.Round(full * Rules.Verification[VerificationTier.AutoChecked]), Opp(r, "exercise:1").Points);
        // All acceptance criteria ticked: evidenced.
        Assert.Equal(VerificationTier.Evidenced, Opp(r, "exercise:2").Verification);
        Assert.True(Opp(r, "exercise:3").Points < Opp(r, "exercise:2").Points);   // the model solution was revealed
        Assert.True(Opp(r, "exercise:4").Points < Opp(r, "exercise:2").Points);   // hints were used
        Assert.Equal(0, Opp(r, "exercise-quality:3").Points);                      // no quality credit after the solution
        Assert.Equal(0, Opp(r, "exercise:5").Points);                              // not completed
        Assert.Equal(Rules.Points.Exercise[ExerciseSize.Complex], Opp(r, "exercise:5").MaxPoints);
    }

    private static ProjectFact Project(int done, int total = 4, bool repo = false, string slug = "employee-management",
        ProjectReviewFact? review = null) => new(
        1, slug, 1, "P", "P", repo,
        Enumerable.Range(1, total).Select(i => new ProjectTaskFact(100 + i, 30, false, [3], i <= done, i <= done ? Now.AddDays(-i) : null, $"t{i}", $"t{i}"))
            .Append(new ProjectTaskFact(200, 60, true, [3], false, null, "cr", "cr")).ToList(),
        0, 6, review);

    [Fact]
    public void The_project_bonus_needs_every_required_task_and_is_separate_from_the_tasks()
    {
        var partial = _calc.Calculate(Snapshot(projects: [Project(done: 3)]), Now);
        Assert.Equal(0, Opp(partial, "project:1").Points);
        Assert.Equal(3, partial.Opportunities.Count(o => o.Activity == XpActivity.ProjectTaskCompleted && o.Points > 0));

        // The optional change request isn't required for the bonus.
        var complete = _calc.Calculate(Snapshot(projects: [Project(done: 4)]), Now);
        var bonus = Rules.Points.ProjectCompletion[ProjectSize.Small];
        Assert.Equal((int)Math.Round(bonus * Rules.Verification[VerificationTier.SelfReported]), Opp(complete, "project:1").Points);
        var taskPoints = complete.Opportunities.Where(o => o.Activity == XpActivity.ProjectTaskCompleted).Sum(o => o.Points);
        Assert.Equal(complete.Xp, taskPoints + Opp(complete, "project:1").Points);

        // A repository link turns self-reported work into evidenced work.
        var withRepo = _calc.Calculate(Snapshot(projects: [Project(done: 4, repo: true)]), Now);
        Assert.True(withRepo.Xp > complete.Xp);
        Assert.Equal(VerificationTier.Evidenced, Opp(withRepo, "project:1").Verification);
    }

    [Fact]
    public void A_project_review_counts_only_once_the_project_is_finished()
    {
        var review = new ProjectReviewFact(new Dictionary<string, int> { ["architecture"] = 4, ["testing"] = 2 }, VerificationTier.SelfReported, Now);
        var unfinished = _calc.Calculate(Snapshot(projects: [Project(done: 2, review: review)]), Now);
        Assert.All(unfinished.Opportunities.Where(o => o.Activity == XpActivity.ProjectReview), o => Assert.Equal(0, o.Points));

        var finished = _calc.Calculate(Snapshot(projects: [Project(done: 4, review: review)]), Now);
        var arch = Opp(finished, "project-review:1:architecture");
        var testing = Opp(finished, "project-review:1:testing");
        Assert.True(arch.Points > testing.Points && testing.Points > 0);
        Assert.Contains("architecture", arch.Categories);
        Assert.Equal(EvidenceKind.Quality, arch.Evidence);
    }

    [Fact]
    public void Self_reported_points_are_capped_per_day()
    {
        // Twenty fundamentals topics ticked on the same day.
        var topics = Enumerable.Range(1, 200).Select(i => new TopicFact(i, $"cs-t{i}", "csharp-fundamentals", i - 1, SkillArea.CSharp,
            TopicPriority.Core, Difficulty.Advanced, 60, "t", "t", TopicStatus.Completed, Now.Date.AddHours(1), null)).ToList();
        var r = _calc.Calculate(Snapshot(topics: topics), Now);
        var topicPoints = r.Opportunities.Where(o => o.Activity == XpActivity.TopicCompleted).Sum(o => o.Points);
        Assert.Equal(Rules.Points.SelfReportedDailyCap, topicPoints);
        Assert.Contains(r.Opportunities, o => o.CappedPoints > 0);
    }

    [Fact]
    public void Category_scores_combine_evidence_with_the_configured_weights_and_overall_uses_category_weights()
    {
        var r = _calc.Calculate(Snapshot(
            topics: Topics((1, TopicStatus.Completed)),
            answers: [new(10, true, Now), new(11, true, Now), new(12, true, Now)]), Now);
        var fundamentals = r.Categories.Single(c => c.Key == "fundamentals");
        var weighed = fundamentals.Evidence.Where(e => e.MaxPoints > 0).ToList();
        var expected = weighed.Sum(e => e.Score * Rules.EvidenceWeights[e.Kind]) / weighed.Sum(e => Rules.EvidenceWeights[e.Kind]);
        Assert.Equal(Math.Round(expected, 1), fundamentals.Score);
        Assert.InRange(fundamentals.Score, 0.1, 100);

        var scored = r.Categories.Where(c => c.MaxPoints > 0).ToList();
        var overall = scored.Sum(c => c.Score * c.Weight) / scored.Sum(c => c.Weight);
        Assert.Equal(Math.Round(overall, 1), r.Overall);
    }

    [Fact]
    public void Points_in_one_category_cannot_buy_a_level_that_other_categories_do_not_support()
    {
        // Every C# fundamentals question answered: plenty of XP for "junior" with a lowered threshold, but no projects.
        var rules = SkillRules.Load();
        var lowXp = new SkillRules
        {
            Points = rules.Points, Verification = rules.Verification, EvidenceWeights = rules.EvidenceWeights, Categories = rules.Categories,
            TopicCategories = rules.TopicCategories, PhaseDifficulty = rules.PhaseDifficulty, InterviewCategories = rules.InterviewCategories,
            ExerciseExtraCategories = rules.ExerciseExtraCategories, ProjectSizes = rules.ProjectSizes, ReviewCriteria = rules.ReviewCriteria,
            Levels = [rules.Levels[0], new LevelRule { Key = "junior", MinXp = 10, Categories = new() { ["fundamentals"] = 10 }, MinProjectTasks = 1 }],
        };
        var answers = new List<AnswerFact> { new(10, true, Now), new(11, true, Now), new(12, true, Now), new(20, true, Now) };
        var r = new SkillCalculator(lowXp).Calculate(Snapshot(answers: answers), Now);

        Assert.True(r.Xp >= 10);
        Assert.Equal("junior", r.XpLevel);          // the points alone would say junior ...
        Assert.Equal("beginner", r.Level);          // ... but no project task has been done
        var unmet = Assert.Single(r.NextLevel);
        Assert.Equal("projectTasks", unmet.Requirement.Code);
    }

    [Fact]
    public void Meeting_every_requirement_moves_the_learner_up_and_lists_what_the_next_level_needs()
    {
        var rules = SkillRules.Load();
        var easy = new SkillRules
        {
            Points = rules.Points, Verification = rules.Verification, EvidenceWeights = rules.EvidenceWeights, Categories = rules.Categories,
            TopicCategories = rules.TopicCategories, PhaseDifficulty = rules.PhaseDifficulty, InterviewCategories = rules.InterviewCategories,
            ExerciseExtraCategories = rules.ExerciseExtraCategories, ProjectSizes = rules.ProjectSizes, ReviewCriteria = rules.ReviewCriteria,
            Levels =
            [
                rules.Levels[0],
                new LevelRule { Key = "junior", MinXp = 20, Categories = new() { ["fundamentals"] = 5 } },
                new LevelRule { Key = "mid", MinXp = 100000, Categories = new() { ["database"] = 50 } },
            ],
        };
        var calc = new SkillCalculator(easy);
        var answers = new List<AnswerFact> { new(10, true, Now), new(11, true, Now), new(12, true, Now), new(20, true, Now), new(21, true, Now) };
        var r = calc.Calculate(Snapshot(topics: Topics((1, TopicStatus.Completed)), answers: answers), Now);

        Assert.Equal("junior", r.Level);
        Assert.InRange(r.ProgressToNext, 0, 99.9);
        var database = r.NextLevel.Single(n => n.Requirement.Category == "database");
        Assert.False(database.Requirement.Met);
        // The SQL topic's quiz is the first thing suggested for the database gap.
        Assert.Contains(database.Actions, a => a.Ref is { Type: "topic", Id: 3 });
        Assert.Contains(r.NextLevel, n => n.Requirement.Code == "xp");
    }

    [Fact]
    public void Weak_topics_and_categories_are_found_from_actual_answers()
    {
        var answers = new List<AnswerFact> { new(30, false, Now), new(31, false, Now), new(32, true, Now), new(10, true, Now), new(11, true, Now), new(12, true, Now) };
        var r = _calc.Calculate(Snapshot(answers: answers), Now);
        var weak = Assert.Single(r.WeakTopics);
        Assert.Equal(3, weak.TopicId);
        Assert.Equal("database", weak.Category);
        Assert.Contains("testing", r.WeakCategories);
    }

    [Fact]
    public void Skill_checks_adapt_to_the_score_of_each_category()
    {
        var r = _calc.Calculate(Snapshot(), Now);
        var database = r.Assessment.Single(a => a.Category == "database");
        Assert.Equal("foundation", database.Band);
        var quiz = database.Checks.First(c => c.Code == "takeQuiz");
        Assert.Equal(new ItemRef("topic", 3, 1), quiz.Ref);
    }

    [Fact]
    public void Old_quiz_evidence_is_flagged_for_a_re_check()
    {
        var old = Now.AddDays(-(Rules.StaleKnowledgeDays + 10));
        var r = _calc.Calculate(Snapshot(answers: [new(30, true, old)]), Now);
        Assert.True(r.Assessment.Single(a => a.Category == "database").Stale);
        Assert.False(r.Assessment.Single(a => a.Category == "testing").Stale);   // no evidence yet: nothing to re-check
    }

    [Fact]
    public void Interview_ratings_are_self_reported_knowledge()
    {
        var r = _calc.Calculate(Snapshot(interviews:
        [
            new(1, 3, InterviewCategory.SqlServer, Difficulty.Advanced, InterviewRating.Confident, Now),
            new(2, 3, InterviewCategory.SqlServer, Difficulty.Advanced, InterviewRating.Partial, Now),
            new(3, 3, InterviewCategory.SqlServer, Difficulty.Advanced, InterviewRating.NeedReview, Now),
        ]), Now);
        var value = Rules.Points.Interview[Difficulty.Advanced] * Rules.Verification[VerificationTier.SelfReported];
        Assert.Equal((int)Math.Round(value), Opp(r, "interview:1").Points);
        Assert.Equal((int)Math.Round(value * Rules.Points.InterviewPartialFactor), Opp(r, "interview:2").Points);
        Assert.Equal(0, Opp(r, "interview:3").Points);
        Assert.Equal(new[] { "database" }, Opp(r, "interview:1").Categories);
    }

    [Fact]
    public void The_rules_file_maps_every_real_topic_and_level_thresholds_increase()
    {
        Assert.Equal(14, Rules.Categories.Count);
        Assert.Equal(new[] { "beginner", "junior", "mid", "senior", "expert" }, Rules.Levels.Select(l => l.Key));
        Assert.Equal("security", Rules.CategoryOfTopic("pro-security", "professional-skills"));
        Assert.Equal("architecture", Rules.CategoryOfTopic("arch-design-patterns", "object-oriented-programming"));
        Assert.Equal("efcore", Rules.CategoryOfTopic("ef-dbcontext", "ef-core"));
        Assert.Equal("database", Rules.CategoryOfTopic("sql-joins", "ef-core"));
        Assert.Equal("problemSolving", Rules.CategoryOfTopic("pro-debugging", "professional-skills"));
        var total = Rules.EvidenceWeights.Values.Sum();
        Assert.Equal(5.0 / total, Rules.EvidenceWeights[EvidenceKind.Passive] / total);
        Assert.Equal(40.0 / total, Rules.EvidenceWeights[EvidenceKind.Project] / total);
    }
}
