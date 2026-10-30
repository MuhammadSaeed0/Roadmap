using System.Text.Json;
using System.Text.RegularExpressions;
using DevPath.Api.DTOs;

namespace DevPath.Api.Services;

/// <summary>
/// The files of a code workspace (a Practice Lab attempt or a Code Playground project), stored as JSON.
/// Paths are relative and made of plain segments, so nothing can point outside the workspace.
/// </summary>
public static partial class WorkspaceFiles
{
    public const int MaxFiles = 80;
    public const int MaxTotalChars = 400_000;
    public const int MaxPathLength = 200;

    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    [GeneratedRegex(@"^[A-Za-z0-9_\-][A-Za-z0-9_.\-]*$")]
    private static partial Regex SegmentPattern();

    /// <summary>Checks the files and returns them with normalised paths ("src/app/app.ts").</summary>
    public static List<WorkspaceFileDto> Validate(IReadOnlyList<WorkspaceFileDto>? files, string field = "files")
    {
        if (files is null) throw new RequestValidationException(field, "files_required", "Send the workspace files.");
        if (files.Count > MaxFiles)
            throw new RequestValidationException(field, "too_many_files", $"A workspace can have at most {MaxFiles} files.");
        var result = new List<WorkspaceFileDto>(files.Count);
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var total = 0;
        foreach (var file in files)
        {
            var path = NormalizePath(file.Path, field);
            if (!seen.Add(path)) throw new RequestValidationException(field, "duplicate_file", $"The file '{path}' appears twice.");
            var content = file.Content ?? "";
            total += content.Length + path.Length;
            if (total > MaxTotalChars)
                throw new RequestValidationException(field, "workspace_too_large", $"A workspace can hold at most {MaxTotalChars:N0} characters.");
            result.Add(new WorkspaceFileDto(path, content));
        }
        return result;
    }

    public static string NormalizePath(string? path, string field = "files")
    {
        var trimmed = (path ?? "").Replace('\\', '/').Trim().Trim('/');
        var segments = trimmed.Split('/');
        if (trimmed.Length == 0 || trimmed.Length > MaxPathLength ||
            segments.Any(s => s is "." or ".." || !SegmentPattern().IsMatch(s)))
            throw new RequestValidationException(field, "invalid_path",
                $"'{path}' is not a valid file path. Use letters, digits, '.', '_' and '-', with '/' between folders.");
        return string.Join('/', segments);
    }

    public static string Serialize(IReadOnlyList<WorkspaceFileDto> files) => JsonSerializer.Serialize(files, Json);

    public static List<WorkspaceFileDto>? Deserialize(string? json) =>
        string.IsNullOrWhiteSpace(json) ? null : JsonSerializer.Deserialize<List<WorkspaceFileDto>>(json, Json);

    public static int Size(IReadOnlyList<WorkspaceFileDto> files) => files.Sum(f => f.Path.Length + f.Content.Length);
}
