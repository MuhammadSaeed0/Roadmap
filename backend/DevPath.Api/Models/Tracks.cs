namespace DevPath.Api.Models;

/// <summary>
/// A roadmap a learner can follow, such as ".NET full-stack" or "AI application developer". It is an ordered list of
/// phases; a phase can belong to several roadmaps (the C# phases are shared), so progress on it counts in each one.
/// An unpublished roadmap is a draft: only administrators see it and the phases that belong to it alone.
/// </summary>
public class Track
{
    public int Id { get; set; }
    public required string Slug { get; set; }
    public int Order { get; set; }
    public required string TitleEn { get; set; }
    public required string TitleAr { get; set; }
    public string SummaryEn { get; set; } = "";
    public string SummaryAr { get; set; } = "";
    /// <summary>What the learner can build or do at the end, shown on the roadmap's card.</summary>
    public string OutcomeEn { get; set; } = "";
    public string OutcomeAr { get; set; } = "";
    /// <summary>Main technologies, comma-separated, shown as chips.</summary>
    public string Technologies { get; set; } = "";
    public string Icon { get; set; } = "map";
    public bool IsPublished { get; set; }

    public List<TrackPhase> Phases { get; set; } = [];
}

/// <summary>A phase in a roadmap. <see cref="Position"/> is its number in that roadmap ("Phase 3").</summary>
public class TrackPhase
{
    public int TrackId { get; set; }
    public Track Track { get; set; } = null!;
    public int PhaseId { get; set; }
    public Phase Phase { get; set; } = null!;
    public int Position { get; set; }
}

/// <summary>The roadmap a learner follows. No row means they haven't chosen yet (new accounts).</summary>
public class UserTrack : IUserOwned
{
    public string UserId { get; set; } = "";
    public required string TrackSlug { get; set; }
    public DateTime ChosenAt { get; set; }
}
