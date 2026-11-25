using System.ComponentModel.DataAnnotations;

namespace DevPath.Api.DTOs;

/// <summary>
/// A roadmap card. Counts cover the whole roadmap; Done and Shared are for the signed-in learner (zero for visitors):
/// SharedPhases is how many of its phases also belong to the learner's active roadmap.
/// </summary>
public record TrackDto(
    string Slug, int Order, string TitleEn, string TitleAr, string SummaryEn, string SummaryAr, string OutcomeEn, string OutcomeAr,
    IReadOnlyList<string> Technologies, string Icon, bool IsDraft, int PhaseCount, int TopicCount, int Minutes,
    int DoneTopics, int SharedPhases);

/// <summary>Every roadmap the caller can see. ChosenSlug is null until the learner picks one (new accounts).</summary>
public record TracksDto(IReadOnlyList<TrackDto> Tracks, string? ActiveSlug, string? ChosenSlug);

public record ChooseTrackRequest([Required, MaxLength(60)] string? Slug);
