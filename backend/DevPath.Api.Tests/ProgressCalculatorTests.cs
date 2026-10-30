using DevPath.Api.Models;
using DevPath.Api.Services;
using static DevPath.Api.Tests.TestData;

namespace DevPath.Api.Tests;

public class ProgressCalculatorTests
{
    private readonly ProgressOptions _options = new();

    [Fact]
    public void Empty_roadmap_is_zero_percent() =>
        Assert.Equal(0, ProgressCalculator.WeightedPercent([], _options));

    [Fact]
    public void Skipped_topics_count_as_done()
    {
        var topics = new[] { Topic(1, status: TopicStatus.Skipped), Topic(2) };
        Assert.Equal(50, ProgressCalculator.WeightedPercent(topics, _options));
    }

    [Fact]
    public void Core_topics_weigh_more_than_optional_topics()
    {
        // Core weight 3, optional weight 1 → finishing only the core topic gives 75%.
        var topics = new[] { Topic(1, priority: TopicPriority.Core, status: TopicStatus.Completed), Topic(2, priority: TopicPriority.Optional) };
        Assert.Equal(75, ProgressCalculator.WeightedPercent(topics, _options));
    }

    [Fact]
    public void Sql_server_topics_count_as_much_as_csharp_topics()
    {
        // Ten SQL topics finished, ten C# topics not started.
        var sql = Enumerable.Range(1, 10).Select(i => Topic(i, skill: SkillArea.SqlServer, status: TopicStatus.Completed));
        var csharp = Enumerable.Range(11, 10).Select(i => Topic(i, skill: SkillArea.CSharp));

        Assert.Equal(50, ProgressCalculator.WeightedPercent(sql.Concat(csharp), _options));
    }

    [Fact]
    public void Each_skill_is_reported_separately()
    {
        var state = State(Topic(1, skill: SkillArea.SqlServer, status: TopicStatus.Skipped), Topic(2, skill: SkillArea.Angular));
        var skills = ProgressCalculator.BySkill(state, _options);

        Assert.Equal(100, skills.Single(s => s.Skill == SkillArea.SqlServer).Percent);
        Assert.Equal(0, skills.Single(s => s.Skill == SkillArea.Angular).Percent);
    }

    [Fact]
    public void Current_phase_is_first_phase_with_unfinished_core_topic()
    {
        var state = State(
            Topic(1, phase: 1, status: TopicStatus.Completed),
            Topic(2, phase: 1, priority: TopicPriority.Optional),     // optional leftovers don't hold you back
            Topic(3, phase: 2));
        Assert.Equal(2, ProgressCalculator.CurrentPhase(state)!.Id);
    }

    [Fact]
    public void Weak_areas_include_completed_topics_with_low_confidence()
    {
        var state = State(Topic(1, status: TopicStatus.Completed, confidence: 1), Topic(2, status: TopicStatus.Completed, confidence: 5));
        var weak = ProgressCalculator.WeakAreas(state);
        Assert.Equal(1, Assert.Single(weak).Topic.Id);
    }
}
