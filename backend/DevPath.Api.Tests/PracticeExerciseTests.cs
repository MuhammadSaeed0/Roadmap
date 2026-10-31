using System.Text.Json;
using DevPath.Api.Data.Seeding;
using DevPath.Api.DTOs;
using DevPath.CodeRunner;
using Microsoft.CodeAnalysis;

namespace DevPath.Api.Tests;

/// <summary>
/// Every C# Practice Lab exercise with automatic checks is run through the same compile-and-run code the
/// browser uses: its model solution must pass every check, and its starter code must not (or the exercise
/// would be solved before the learner starts).
/// </summary>
public class PracticeExerciseTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly string Seed = Path.Combine(AppContext.BaseDirectory, "SeedData");

    // The same reference set the browser runner gets (DevPath.CodeRunner.csproj), from this process's runtime.
    private static readonly string[] ReferenceNames =
    [
        "System.Runtime", "System.Console", "System.Collections", "System.Collections.Concurrent", "System.Collections.Immutable",
        "System.Linq", "System.Linq.Expressions", "System.Linq.Queryable", "System.Text.RegularExpressions", "System.Threading", "System.Threading.Tasks",
        "System.Runtime.Extensions", "System.ComponentModel.Annotations", "System.ComponentModel.Primitives", "System.ComponentModel",
        "System.ObjectModel", "System.Text.Json", "System.Memory", "System.Runtime.Numerics", "System.Text.Encoding.Extensions",
        "System.Diagnostics.Debug", "netstandard", "System.Private.CoreLib",
    ];

    private static readonly CSharpRunner Runner = new(
        ((string)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")!).Split(Path.PathSeparator)
            .Where(p => ReferenceNames.Contains(Path.GetFileNameWithoutExtension(p)))
            .Select(p => (MetadataReference)MetadataReference.CreateFromFile(p))
            .ToList());

    public static TheoryData<string> CSharpExercises()
    {
        var data = new TheoryData<string>();
        foreach (var file in Directory.GetFiles(Path.Combine(Seed, "practice"), "*.json"))
            foreach (var e in JsonSerializer.Deserialize<List<ExerciseSeed>>(File.ReadAllText(file), new JsonSerializerOptions(JsonSerializerDefaults.Web) { Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() } })!)
                if (e.Runner == Models.ExerciseRunner.CSharp && File.Exists(Path.Combine(Seed, "practice-files", e.Key, "tests.cs")))
                    data.Add(e.Key);
        return data;
    }

    private static List<SourceFile> Files(string key, string part)
    {
        var store = new PracticeFileStore(Path.Combine(Seed, "practice-files"));
        return (JsonSerializer.Deserialize<List<WorkspaceFileDto>>(store.Files(key, part) ?? "[]", Json) ?? [])
            .Select(f => new SourceFile(f.Path, f.Content)).ToList();
    }

    [Theory, MemberData(nameof(CSharpExercises))]
    public async Task Model_solution_passes_every_check_and_the_starter_does_not(string key)
    {
        var tests = File.ReadAllText(Path.Combine(Seed, "practice-files", key, "tests.cs"));
        var starter = Files(key, "starter");
        var solution = Files(key, "solution");
        Assert.NotEmpty(starter);
        Assert.NotEmpty(solution);

        // The solution replaces starter files with the same path; other starter files (data, Program.cs) stay.
        var solved = starter.Where(s => solution.All(f => f.Path != s.Path)).Concat(solution).ToList();
        var result = await Runner.RunAsync(new RunRequest(solved, tests));
        Assert.True(result.Compiled, string.Join("\n", result.Diagnostics.Select(d => $"{d.File}({d.Line}): {d.Message}")));
        Assert.NotNull(result.Tests);
        Assert.True(result.Tests!.Count >= 3, "each exercise should have at least three checks");
        Assert.All(result.Tests, t => Assert.True(t.Passed, $"{t.Name}: {t.Message}"));

        var unsolved = await Runner.RunAsync(new RunRequest(starter, tests));
        Assert.False(unsolved.Compiled && unsolved.Tests!.All(t => t.Passed), "the starter code already passes every check");
    }

    [Fact]
    public async Task Runner_reports_output_input_exceptions_and_compile_errors()
    {
        var ok = await Runner.RunAsync(new RunRequest([new SourceFile("Program.cs", "Console.WriteLine(\"Hi \" + Console.ReadLine());")], Stdin: "Sara\n"));
        Assert.True(ok.Compiled);
        Assert.Equal("Hi Sara\n", ok.Output.Replace("\r\n", "\n"));

        var thrown = await Runner.RunAsync(new RunRequest([new SourceFile("Program.cs", "int[] a = [1];\nConsole.WriteLine(a[3]);")]));
        Assert.Contains("IndexOutOfRangeException", thrown.Exception);

        var broken = await Runner.RunAsync(new RunRequest([new SourceFile("Program.cs", "int x = \"text\";")]));
        Assert.False(broken.Compiled);
        Assert.Contains(broken.Diagnostics, d => d.Id == "CS0029" && d.File == "Program.cs" && d.Line == 1);
    }

    /// <summary>
    /// The browser runs .NET on one thread. Async programs must be awaited, not blocked on: blocking (what the
    /// compiler's synchronous "&lt;Main&gt;" wrapper does) would wait forever for a continuation that needs that thread.
    /// The runs here use a single-threaded SynchronizationContext, like the browser, so blocking would hang.
    /// </summary>
    [Theory]
    [InlineData("var prices = await Task.WhenAll(Price(\"a\"), Price(\"bb\"));\nConsole.WriteLine(string.Join(\",\", prices));\n" +
                "static async Task<int> Price(string s) { await Task.Delay(50); return s.Length; }", "1,2")]
    [InlineData("class P { static async Task Main() { await Task.Delay(50); Console.WriteLine(\"main done\"); } }", "main done")]
    [InlineData("class P { static async Task<int> Main(string[] args) { await Task.Yield(); Console.WriteLine(\"args \" + args.Length); return 0; } }", "args 0")]
    public void Async_programs_run_on_a_single_thread(string program, string expected)
    {
        var result = SingleThread.Run(() => Runner.RunAsync(new RunRequest([new SourceFile("Program.cs", program)])), TimeSpan.FromSeconds(20));
        Assert.Null(result.Exception);
        Assert.Equal(expected, result.Output.Trim());
    }

    /// <summary>Runs async code with every continuation queued back to one thread, as in WebAssembly.</summary>
    private sealed class SingleThread : SynchronizationContext
    {
        private readonly System.Collections.Concurrent.BlockingCollection<(SendOrPostCallback, object?)> _queue = [];

        public override void Post(SendOrPostCallback d, object? state) => _queue.Add((d, state));

        public static T Run<T>(Func<Task<T>> work, TimeSpan timeout)
        {
            var context = new SingleThread();
            T result = default!;
            var thread = new Thread(() =>
            {
                SetSynchronizationContext(context);
                var task = work();
                task.ContinueWith(_ => context._queue.CompleteAdding(), TaskScheduler.Default);
                foreach (var (callback, state) in context._queue.GetConsumingEnumerable()) callback(state);
                result = task.GetAwaiter().GetResult();
            }) { IsBackground = true };
            thread.Start();
            Assert.True(thread.Join(timeout), "The program never finished: it blocked the only thread.");
            return result;
        }
    }

    [Fact]
    public async Task Runaway_output_is_cut_off()
    {
        var r = await Runner.RunAsync(new RunRequest([new SourceFile("Program.cs", "while (true) Console.Write(\"spam \");")]));
        Assert.True(r.OutputTruncated);
        Assert.Contains("Output limit", r.Exception);
    }
}
