using DevPath.Api.Models;
using DevPath.Api.Services;
using static DevPath.Api.Tests.TestData;

namespace DevPath.Api.Tests;

public class RecommendationEngineTests
{
    private static RecommendationInput Input(LearningState state, bool allowSkip = false, SkillArea? focus = null,
        int? minutes = null, Dictionary<int, ProjectNeed>? needs = null) =>
        new(state, needs ?? [], allowSkip, focus, minutes);

    [Fact]
    public void Topics_with_unfinished_prerequisites_are_not_recommended()
    {
        var state = State(Topic(1), Topic(2, prerequisites: 1));
        var ranked = RecommendationEngine.Rank(Input(state));
        Assert.DoesNotContain(ranked, r => r.Topic.Id == 2);
    }

    [Fact]
    public void Skipping_prerequisites_can_be_allowed_and_is_explained()
    {
        var state = State(Topic(1), Topic(2, prerequisites: 1));
        var topic2 = RecommendationEngine.Rank(Input(state, allowSkip: true)).Single(r => r.Topic.Id == 2);
        Assert.Contains(topic2.Reasons, r => r.Code == "prerequisitesSkipped");
    }

    [Fact]
    public void Completed_and_known_topics_are_never_recommended()
    {
        var state = State(Topic(1, status: TopicStatus.Completed), Topic(2, status: TopicStatus.Skipped), Topic(3));
        Assert.Equal([3], RecommendationEngine.Rank(Input(state)).Select(r => r.Topic.Id));
    }

    [Fact]
    public void A_topic_already_in_progress_comes_first()
    {
        var state = State(Topic(1), Topic(2, status: TopicStatus.InProgress));
        var top = RecommendationEngine.Rank(Input(state))[0];
        Assert.Equal(2, top.Topic.Id);
        Assert.Contains(top.Reasons, r => r.Code == "inProgress");
    }

    [Fact]
    public void Topics_needed_by_a_project_get_a_reason_naming_the_project()
    {
        var state = State(Topic(1), Topic(2));
        var needs = new Dictionary<int, ProjectNeed> { [2] = new(4, "Sales and Order Management System", "نظام إدارة المبيعات") };
        var top = RecommendationEngine.Rank(Input(state, needs: needs))[0];
        Assert.Equal(2, top.Topic.Id);
        Assert.Equal("Sales and Order Management System", top.Reasons.Single(r => r.Code == "neededForProject").Params!["projectEn"]);
    }

    [Fact]
    public void Available_time_favours_topics_that_fit()
    {
        var state = State(Topic(1, minutes: 90), Topic(2, minutes: 20));
        Assert.Equal(2, RecommendationEngine.Rank(Input(state, minutes: 30))[0].Topic.Id);
    }

    [Fact]
    public void Ranking_is_deterministic()
    {
        var state = State(Topic(1), Topic(2), Topic(3, phase: 2));
        var first = RecommendationEngine.Rank(Input(state)).Select(r => r.Topic.Id);
        var second = RecommendationEngine.Rank(Input(state)).Select(r => r.Topic.Id);
        Assert.Equal(first, second);
    }
}
