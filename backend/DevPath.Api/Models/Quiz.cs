namespace DevPath.Api.Models;

/// <summary>
/// A multiple-choice question that checks the idea of one topic, seeded from SeedData/quizzes
/// (content, shared by everyone). The correct option and the explanation are only sent to the
/// browser after the user has answered.
/// </summary>
public class QuizQuestion
{
    public int Id { get; set; }
    public required string Key { get; set; }
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    public int Order { get; set; }
    public required string QuestionEn { get; set; }
    public required string QuestionAr { get; set; }
    /// <summary>Options in display order; OptionsAr[i] translates OptionsEn[i].</summary>
    public List<string> OptionsEn { get; set; } = [];
    public List<string> OptionsAr { get; set; } = [];
    /// <summary>Index of the correct option.</summary>
    public int AnswerIndex { get; set; }
    public string ExplanationEn { get; set; } = "";
    public string ExplanationAr { get; set; } = "";
}

/// <summary>A hand-picked YouTube tutorial that shows how to build one project task (SeedData/project-videos.json).</summary>
public class ProjectTaskVideo
{
    public int Id { get; set; }
    public int ProjectTaskId { get; set; }
    public ProjectTask ProjectTask { get; set; } = null!;
    /// <summary>YouTube's 11-character video id.</summary>
    public required string VideoId { get; set; }
    public required string Title { get; set; }
    public string ChannelTitle { get; set; } = "";
    public int Order { get; set; }
}
