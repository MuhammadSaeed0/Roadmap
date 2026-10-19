using DevPath.Api.Data;
using DevPath.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Services;

/// <summary>
/// Global search across all content using parameterised LIKE queries — simple and
/// fast enough for a few thousand rows, with no extra search engine to run.
/// EF Core sends the pattern as a SQL parameter, so user input can't inject SQL.
/// </summary>
public class SearchService(AppDbContext db)
{
    private const int PerGroup = 6;

    /// <summary>Escapes LIKE wildcards so "%" or "_" typed by the user are matched literally.</summary>
    public static string LikePattern(string term)
    {
        var escaped = term.Trim().Replace("[", "[[]").Replace("%", "[%]").Replace("_", "[_]");
        return $"%{escaped}%";
    }

    public async Task<SearchResultDto> SearchAsync(string query, CancellationToken ct)
    {
        var p = LikePattern(query);
        var groups = new List<SearchGroupDto>();

        void AddGroup(string category, List<SearchHitDto> hits)
        {
            if (hits.Count > 0) groups.Add(new SearchGroupDto(category, hits));
        }

        AddGroup("topics", await db.Topics.AsNoTracking()
            .Where(t => EF.Functions.Like(t.TitleEn, p) || EF.Functions.Like(t.TitleAr, p)
                     || EF.Functions.Like(t.SummaryEn, p) || EF.Functions.Like(t.SummaryAr, p))
            .OrderBy(t => EF.Functions.Like(t.TitleEn, p) || EF.Functions.Like(t.TitleAr, p) ? 0 : 1)
            .ThenBy(t => t.Phase.Order).ThenBy(t => t.Order)
            .Take(PerGroup)
            .Select(t => new SearchHitDto(t.Id, t.TitleEn, t.TitleAr, t.Phase.TitleEn, t.Phase.TitleAr, null, null))
            .ToListAsync(ct));

        AddGroup("projects", await db.Projects.AsNoTracking()
            .Where(x => EF.Functions.Like(x.TitleEn, p) || EF.Functions.Like(x.TitleAr, p)
                     || EF.Functions.Like(x.SummaryEn, p) || EF.Functions.Like(x.SummaryAr, p) || EF.Functions.Like(x.TechStack, p))
            .OrderBy(x => x.Order).Take(PerGroup)
            .Select(x => new SearchHitDto(x.Id, x.TitleEn, x.TitleAr, x.TechStack, x.TechStack, null, null))
            .ToListAsync(ct));

        AddGroup("tasks", await db.ProjectTasks.AsNoTracking()
            .Where(x => EF.Functions.Like(x.TitleEn, p) || EF.Functions.Like(x.TitleAr, p)
                     || EF.Functions.Like(x.DescriptionEn, p) || EF.Functions.Like(x.DescriptionAr, p))
            .OrderBy(x => x.Milestone.Project.Order).ThenBy(x => x.Milestone.Order).ThenBy(x => x.Order).Take(PerGroup)
            .Select(x => new SearchHitDto(x.Id, x.TitleEn, x.TitleAr, x.Milestone.Project.TitleEn, x.Milestone.Project.TitleAr,
                x.Milestone.ProjectId, null))
            .ToListAsync(ct));

        AddGroup("practice", await db.PracticeExercises.AsNoTracking()
            .Where(x => EF.Functions.Like(x.TitleEn, p) || EF.Functions.Like(x.TitleAr, p)
                     || EF.Functions.Like(x.ProblemEn, p) || EF.Functions.Like(x.ProblemAr, p))
            .OrderBy(x => x.Id).Take(PerGroup)
            .Select(x => new SearchHitDto(x.Id, x.TitleEn, x.TitleAr, x.Topic.TitleEn, x.Topic.TitleAr, null, null))
            .ToListAsync(ct));

        AddGroup("interview", await db.InterviewQuestions.AsNoTracking()
            .Where(x => EF.Functions.Like(x.QuestionEn, p) || EF.Functions.Like(x.QuestionAr, p)
                     || EF.Functions.Like(x.AnswerEn, p) || EF.Functions.Like(x.AnswerAr, p))
            .OrderBy(x => x.Id).Take(PerGroup)
            .Select(x => new SearchHitDto(x.Id, x.QuestionEn, x.QuestionAr, x.Topic.TitleEn, x.Topic.TitleAr, null, null))
            .ToListAsync(ct));

        AddGroup("resources", await db.Resources.AsNoTracking()
            .Where(x => EF.Functions.Like(x.TitleEn, p) || EF.Functions.Like(x.TitleAr!, p) || EF.Functions.Like(x.SourceName, p))
            .OrderBy(x => x.Id).Take(PerGroup)
            .Select(x => new SearchHitDto(x.Id, x.TitleEn, x.TitleAr ?? x.TitleEn, x.SourceName, x.SourceName, null, x.Url))
            .ToListAsync(ct));

        AddGroup("notes", await db.Notes.AsNoTracking()
            .Where(x => EF.Functions.Like(x.Title, p) || EF.Functions.Like(x.Content, p))
            .OrderByDescending(x => x.UpdatedAt).Take(PerGroup)
            .Select(x => new SearchHitDto(x.Id, x.Title, x.Title, null, null, null, null))
            .ToListAsync(ct));

        return new SearchResultDto(query, groups);
    }
}
