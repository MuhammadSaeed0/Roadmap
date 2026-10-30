using DevPath.Api.Models;

namespace DevPath.Api.Services;

/// <summary>
/// Weights for the overall roadmap percentage, bound from the "Progress" section of
/// appsettings.json so you can tune them without changing code.
///
///   topic weight = PriorityWeights[topic.Priority] × SkillWeights[topic.Skill]
///   overall %    = Σ weight(done topics) ÷ Σ weight(all topics) × 100
///
/// Lower skill weights are for supporting areas (Git, professional skills); the core
/// stack, SQL Server included, counts fully. Per-skill progress is always reported
/// separately so nothing is hidden.
/// </summary>
public class ProgressOptions
{
    public const string SectionName = "Progress";

    public Dictionary<SkillArea, double> SkillWeights { get; set; } = new()
    {
        [SkillArea.CSharp] = 1.0,
        [SkillArea.AspNetCore] = 1.0,
        [SkillArea.EfCore] = 1.0,
        [SkillArea.SqlServer] = 1.0,
        [SkillArea.TypeScript] = 0.8,
        [SkillArea.Angular] = 1.0,
        [SkillArea.FullStack] = 1.0,
        [SkillArea.Testing] = 0.9,
        [SkillArea.Git] = 0.6,
        [SkillArea.Professional] = 0.7,
    };

    public Dictionary<TopicPriority, double> PriorityWeights { get; set; } = new()
    {
        [TopicPriority.Core] = 3,
        [TopicPriority.Important] = 2,
        [TopicPriority.Optional] = 1,
    };

    public double WeightOf(SkillArea skill, TopicPriority priority) =>
        SkillWeights.GetValueOrDefault(skill, 1.0) * PriorityWeights.GetValueOrDefault(priority, 1.0);
}
