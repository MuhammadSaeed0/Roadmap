using DevPath.Api.DTOs;
using DevPath.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DevPath.Api.Controllers;

/// <summary>Challenges with points, the leaderboard, submission history and the written tutorials of topics.</summary>
[ApiController]
[Route("api")]
public class ChallengesController(ChallengeService challenges) : ControllerBase
{
    [HttpGet("challenges")]
    public Task<ChallengesDto> Get(CancellationToken ct) => challenges.GetAsync(ct);

    [HttpGet("challenges/leaderboard")]
    public Task<IReadOnlyList<LeaderboardRowDto>> Leaderboard(CancellationToken ct) => challenges.LeaderboardAsync(ct);

    /// <summary>The learner's earlier runs of an exercise's checks, newest first.</summary>
    [HttpGet("practice/{id:int}/submissions")]
    public Task<IReadOnlyList<SubmissionDto>> Submissions(int id, CancellationToken ct) => challenges.SubmissionsAsync(id, ct);

    [HttpGet("practice/submissions/{id:long}")]
    public Task<SubmissionDetailDto> Submission(long id, CancellationToken ct) => challenges.SubmissionAsync(id, ct);

    [HttpGet("topics/{id:int}/lessons")]
    public Task<IReadOnlyList<LessonDto>> Lessons(int id, CancellationToken ct) => challenges.LessonsAsync(id, ct);
}
