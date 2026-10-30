using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;
using DevPath.CodeRunner;
using Microsoft.CodeAnalysis;

// The runtime starts when worker.js loads it; the work happens in the exported methods below.
return;

/// <summary>Entry points called from worker.js.</summary>
public static partial class RunnerExports
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly List<MetadataReference> References = [];
    private static CSharpRunner? _runner;

    [JSExport]
    public static void AddReference(string name, byte[] image) =>
        References.Add(MetadataReference.CreateFromImage(image, filePath: name + ".dll"));

    [JSExport]
    public static async Task<string> Run(string requestJson)
    {
        var request = JsonSerializer.Deserialize<RunRequest>(requestJson, Json)
            ?? throw new ArgumentException("Empty run request.");
        _runner ??= new CSharpRunner(References);
        var result = await _runner.RunAsync(request);
        return JsonSerializer.Serialize(result, Json);
    }
}
