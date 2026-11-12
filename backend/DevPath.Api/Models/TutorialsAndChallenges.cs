namespace DevPath.Api.Models;

/// <summary>
/// One lesson of a topic's written tutorial: a short explanation, an example and its output.
/// Seeded from SeedData/tutorials (content, shared by everyone) and synchronised by key.
/// </summary>
public class TopicLesson
{
    public int Id { get; set; }
    public required string Key { get; set; }
    public int TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    public int Order { get; set; }
    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }
    /// <summary>Paragraphs separated by a blank line; a line starting with "- " is a list item; `code` is inline code.</summary>
    public string BodyEn { get; set; } = "";
    public string BodyAr { get; set; } = "";
    public string? Code { get; set; }
    public string? CodeLanguage { get; set; }
    /// <summary>What the example prints, shown under it.</summary>
    public string? Output { get; set; }
}

/// <summary>
/// One run of an exercise's automatic checks, kept so the learner can look back at earlier attempts.
/// The checks run in the learner's browser, so the result is their own record, not a verified grade.
/// </summary>
public class PracticeSubmission : IUserOwned
{
    public long Id { get; set; }
    public string UserId { get; set; } = "";
    public int ExerciseId { get; set; }
    public PracticeExercise Exercise { get; set; } = null!;
    public int Passed { get; set; }
    public int Total { get; set; }
    /// <summary>JSON array of { path, content }: the code that was submitted.</summary>
    public required string Files { get; set; }
    public DateTime CreatedAt { get; set; }
}
