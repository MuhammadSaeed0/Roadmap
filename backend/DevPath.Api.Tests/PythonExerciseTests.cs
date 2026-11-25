using System.ComponentModel;
using System.Diagnostics;
using System.Text.Json;
using System.Text.Json.Serialization;
using DevPath.Api.Data.Seeding;

namespace DevPath.Api.Tests;

/// <summary>
/// The Python exercises and lesson examples, run with a real Python 3 the way the browser runner
/// (runners/python/python-engine.js) runs them: checks are the test* functions of tests.py, a failed assert is a
/// failed check. A model solution must pass every check (at least three) and the starter must fail one; a lesson
/// example must print exactly the output the lesson shows.
/// </summary>
public class PythonExerciseTests
{
    private static readonly string Seed = Path.Combine(AppContext.BaseDirectory, "SeedData");
    private static readonly JsonSerializerOptions SeedJson = new(JsonSerializerDefaults.Web) { Converters = { new JsonStringEnumConverter() } };

    /// <summary>Mirrors the browser engine: run the test functions of tests.py next to the learner's files.</summary>
    private const string Harness = """
        import json, os, sys, types
        folder, tests_path = sys.argv[1], sys.argv[2]
        os.chdir(folder)
        sys.path.insert(0, folder)
        ns = {"__name__": "__main__"}
        results = []
        try:
            exec(compile(open(tests_path, encoding="utf-8").read(), "tests.py", "exec"), ns)
        except BaseException as e:
            results.append({"name": "tests.py", "passed": False, "message": f"{type(e).__name__}: {e}"})
        for name, fn in list(ns.items()):
            if name.startswith("test") and isinstance(fn, types.FunctionType) and fn.__code__.co_filename == "tests.py":
                try:
                    fn()
                    results.append({"name": name, "passed": True, "message": None})
                except BaseException as e:
                    results.append({"name": name, "passed": False, "message": f"{type(e).__name__}: {e}"})
        print("@@RESULTS@@" + json.dumps(results))
        """;

    private sealed record Check(string Name, bool Passed, string? Message);

    public static TheoryData<string> PythonExercises()
    {
        var data = new TheoryData<string>();
        foreach (var file in Directory.GetFiles(Path.Combine(Seed, "practice"), "*.json"))
            foreach (var e in JsonSerializer.Deserialize<List<ExerciseSeed>>(File.ReadAllText(file), SeedJson)!)
                if (e.Runner == Models.ExerciseRunner.Python)
                    data.Add(e.Key);
        return data;
    }

    public static TheoryData<string> PythonLessonsWithOutput()
    {
        var data = new TheoryData<string>();
        foreach (var file in Directory.GetFiles(Path.Combine(Seed, "tutorials"), "*.json"))
            foreach (var t in JsonSerializer.Deserialize<List<TutorialSeed>>(File.ReadAllText(file), SeedJson)!)
                foreach (var l in t.Lessons.Where(l => l.Language == "python" && l.Output is not null))
                    data.Add(l.Key);
        return data;
    }

    [Theory, MemberData(nameof(PythonExercises))]
    public void Python_model_solution_passes_every_check_and_the_starter_does_not(string key)
    {
        var folder = Path.Combine(Seed, "practice-files", key);
        Assert.True(File.Exists(Path.Combine(folder, "tests.py")), $"{key} has no tests.py");

        var solved = RunChecks(Path.Combine(folder, "solution"), Path.Combine(folder, "tests.py"));
        Assert.True(solved.Count >= 3, $"{key} has {solved.Count} checks; at least 3 expected");
        Assert.All(solved, c => Assert.True(c.Passed, $"{key} solution fails '{c.Name}': {c.Message}"));

        var starter = RunChecks(Path.Combine(folder, "starter"), Path.Combine(folder, "tests.py"));
        Assert.Contains(starter, c => !c.Passed);
    }

    [Theory, MemberData(nameof(PythonLessonsWithOutput))]
    public void Python_lesson_example_prints_the_output_shown(string key)
    {
        var lesson = Directory.GetFiles(Path.Combine(Seed, "tutorials"), "*.json")
            .SelectMany(f => JsonSerializer.Deserialize<List<TutorialSeed>>(File.ReadAllText(f), SeedJson)!)
            .SelectMany(t => t.Lessons).Single(l => l.Key == key);
        var dir = Directory.CreateTempSubdirectory("devpath-py-lesson-").FullName;
        try
        {
            File.WriteAllText(Path.Combine(dir, "main.py"), lesson.Code!);
            var (output, exit) = Python(dir, "main.py");
            Assert.True(exit == 0, $"{key} exited with {exit}: {output}");
            Assert.Equal(lesson.Output, output.Replace("\r\n", "\n").TrimEnd('\n'));
        }
        finally
        {
            Directory.Delete(dir, recursive: true);
        }
    }

    private static List<Check> RunChecks(string sourceFolder, string testsFile)
    {
        var dir = Directory.CreateTempSubdirectory("devpath-py-").FullName;
        try
        {
            foreach (var file in Directory.EnumerateFiles(sourceFolder, "*", SearchOption.AllDirectories))
            {
                var target = Path.Combine(dir, Path.GetRelativePath(sourceFolder, file));
                Directory.CreateDirectory(Path.GetDirectoryName(target)!);
                File.Copy(file, target);
            }
            var harness = Path.Combine(dir, "__devpath_harness.py");
            File.WriteAllText(harness, Harness);
            var (output, _) = Python(dir, harness, dir, testsFile);
            var line = output.Split('\n').LastOrDefault(l => l.StartsWith("@@RESULTS@@"))
                ?? throw new Xunit.Sdk.XunitException($"No results from the harness: {output}");
            return JsonSerializer.Deserialize<List<Check>>(line["@@RESULTS@@".Length..], new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
        }
        finally
        {
            Directory.Delete(dir, recursive: true);
        }
    }

    /// <summary>Runs Python 3 ("python3" on Linux and macOS, "python" on Windows) and returns its output.</summary>
    private static (string Output, int ExitCode) Python(string workingDirectory, params string[] args)
    {
        foreach (var exe in OperatingSystem.IsWindows() ? new[] { "python", "py", "python3" } : ["python3", "python"])
        {
            var start = new ProcessStartInfo(exe)
            {
                WorkingDirectory = workingDirectory, RedirectStandardOutput = true, RedirectStandardError = true,
                StandardOutputEncoding = System.Text.Encoding.UTF8, StandardErrorEncoding = System.Text.Encoding.UTF8,
            };
            foreach (var a in args) start.ArgumentList.Add(a);
            start.Environment["PYTHONIOENCODING"] = "utf-8";
            start.Environment["PYTHONDONTWRITEBYTECODE"] = "1";
            Process process;
            try { process = Process.Start(start)!; }
            catch (Win32Exception) { continue; }
            var stdout = process.StandardOutput.ReadToEndAsync();
            var stderr = process.StandardError.ReadToEndAsync();
            if (!process.WaitForExit(60_000)) { process.Kill(true); throw new TimeoutException($"{exe} took more than a minute"); }
            return (stdout.Result + stderr.Result, process.ExitCode);
        }
        throw new InvalidOperationException("Python 3 is needed to check the Python exercises (install it, or put python3 on the PATH).");
    }
}
