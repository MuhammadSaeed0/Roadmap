using System.Diagnostics;
using System.Reflection;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace DevPath.CodeRunner;

public sealed record SourceFile(string Path, string Content);

public sealed record RunRequest(IReadOnlyList<SourceFile> Files, string? Tests = null, string? Stdin = null);

public sealed record RunDiagnostic(string File, int Line, int Column, int EndLine, int EndColumn, string Severity, string Id, string Message);

public sealed record TestResult(string Name, bool Passed, string? Message);

public sealed record RunResult(
    bool Compiled,
    IReadOnlyList<RunDiagnostic> Diagnostics,
    string Output,
    bool OutputTruncated,
    string? Exception,
    IReadOnlyList<TestResult>? Tests,
    long CompileMs,
    long RunMs);

/// <summary>
/// Compiles learner C# with Roslyn into an in-memory assembly and runs it: either its entry point
/// (a Main method or top-level statements) or, when the exercise has tests, every method marked
/// [Test] in the tests file. The same code runs in the browser runner and in the backend tests that
/// check each exercise's model solution against its own tests.
/// </summary>
public sealed class CSharpRunner(IReadOnlyList<MetadataReference> references)
{
    public const string TestsFileName = "Tests.cs";
    public const int MaxOutputChars = 100_000;

    private static readonly CSharpParseOptions ParseOptions = new(LanguageVersion.Latest);

    private const string GlobalUsings =
        "global using System; global using System.Collections.Generic; global using System.IO; global using System.Linq; " +
        "global using System.Text; global using System.Threading; global using System.Threading.Tasks;";

    /// <summary>A tiny test framework so exercises can check learner code without any package.</summary>
    private const string TestFramework = """
        global using DevPath.Testing;
        namespace DevPath.Testing
        {
            [System.AttributeUsage(System.AttributeTargets.Method)]
            public sealed class TestAttribute(string name) : System.Attribute { public string Name { get; } = name; }

            public sealed class AssertException(string message) : System.Exception(message);

            public static class Assert
            {
                private static string Show(object? value) => value switch
                {
                    null => "null",
                    string s => "\"" + s + "\"",
                    System.Collections.IEnumerable e and not string => "[" + string.Join(", ", e.Cast<object?>().Select(Show)) + "]",
                    _ => value.ToString() ?? "",
                };

                public static void Equal<T>(T expected, T actual, string? message = null)
                {
                    if (!EqualityComparer<T>.Default.Equals(expected, actual))
                        throw new AssertException((message is null ? "" : message + ": ") + "expected " + Show(expected) + " but got " + Show(actual));
                }

                public static void SequenceEqual<T>(IEnumerable<T> expected, IEnumerable<T>? actual, string? message = null)
                {
                    if (actual is null || !expected.SequenceEqual(actual))
                        throw new AssertException((message is null ? "" : message + ": ") + "expected " + Show(expected) + " but got " + Show(actual));
                }

                public static void Near(double expected, double actual, double tolerance = 1e-6, string? message = null)
                {
                    if (System.Math.Abs(expected - actual) > tolerance)
                        throw new AssertException((message is null ? "" : message + ": ") + "expected " + expected + " but got " + actual);
                }

                public static void True(bool condition, string message) { if (!condition) throw new AssertException(message); }

                public static void False(bool condition, string message) { if (condition) throw new AssertException(message); }

                public static void NotNull(object? value, string message) { if (value is null) throw new AssertException(message); }

                public static TException Throws<TException>(System.Action action, string? message = null) where TException : System.Exception
                {
                    try { action(); }
                    catch (TException e) { return e; }
                    catch (System.Exception e) { throw new AssertException((message is null ? "" : message + ": ") + "expected " + typeof(TException).Name + " but got " + e.GetType().Name + ": " + e.Message); }
                    throw new AssertException((message is null ? "" : message + ": ") + "expected " + typeof(TException).Name + " but nothing was thrown");
                }
            }
        }
        """;

    /// <summary>
    /// Console.SetIn isn't supported by .NET in the browser, so Console.ReadLine() and Console.Read() in learner code
    /// are redirected (see <see cref="ConsoleInputRewriter"/>) to this class, which reads the "Input" box.
    /// </summary>
    private const string InputSource = """
        namespace DevPath.Runtime
        {
            public static class LearnerInput
            {
                public static System.IO.TextReader Reader = System.IO.TextReader.Null;
                public static string? ReadLine() => Reader.ReadLine();
                public static int Read() => Reader.Read();
            }
        }
        """;

    private sealed class ConsoleInputRewriter : CSharpSyntaxRewriter
    {
        public override SyntaxNode? VisitInvocationExpression(InvocationExpressionSyntax node)
        {
            var visited = (InvocationExpressionSyntax)base.VisitInvocationExpression(node)!;
            if (visited.Expression is MemberAccessExpressionSyntax { Name.Identifier.Text: "ReadLine" or "Read" } access &&
                access.Expression.ToString() is "Console" or "System.Console" or "global::System.Console" &&
                visited.ArgumentList.Arguments.Count == 0)
            {
                var target = SyntaxFactory.ParseExpression($"global::DevPath.Runtime.LearnerInput.{access.Name.Identifier.Text}");
                return visited.WithExpression(target.WithTriviaFrom(visited.Expression));
            }
            return visited;
        }
    }

    public async Task<RunResult> RunAsync(RunRequest request)
    {
        var compileWatch = Stopwatch.StartNew();
        var trees = new List<SyntaxTree> { Parse(GlobalUsings, "GlobalUsings.cs") };
        var userTrees = request.Files
            .Where(f => f.Path.EndsWith(".cs", StringComparison.OrdinalIgnoreCase))
            .Select(f => Parse(f.Content, f.Path))
            .Select(t => t.WithRootAndOptions(new ConsoleInputRewriter().Visit(t.GetRoot()), t.Options))
            .ToList();
        trees.AddRange(userTrees);
        trees.Add(Parse(InputSource, "LearnerInput.cs"));
        var testing = !string.IsNullOrWhiteSpace(request.Tests);
        if (testing)
        {
            trees.Add(Parse(TestFramework, "TestFramework.cs"));
            trees.Add(Parse(request.Tests!, TestsFileName));
        }

        // Top-level statements only compile into an executable; anything else can be a library.
        var hasTopLevel = userTrees.Any(t => t.GetRoot().ChildNodes().OfType<GlobalStatementSyntax>().Any());
        var hasMain = userTrees.Any(t => t.GetRoot().DescendantNodes().OfType<MethodDeclarationSyntax>()
            .Any(m => m.Identifier.Text == "Main" && m.Modifiers.Any(SyntaxKind.StaticKeyword)));
        var kind = hasTopLevel || (hasMain && !testing) ? OutputKind.ConsoleApplication : OutputKind.DynamicallyLinkedLibrary;

        var compilation = CSharpCompilation.Create("LearnerCode", trees, references,
            new CSharpCompilationOptions(kind, nullableContextOptions: NullableContextOptions.Enable,
                concurrentBuild: false, allowUnsafe: false, optimizationLevel: OptimizationLevel.Debug));

        using var image = new MemoryStream();
        var emit = compilation.Emit(image);
        var diagnostics = emit.Diagnostics
            .Where(d => d.Severity is DiagnosticSeverity.Error or DiagnosticSeverity.Warning)
            .Where(d => d.Location.IsInSource && d.Location.SourceTree?.FilePath is not ("GlobalUsings.cs" or "TestFramework.cs" or "LearnerInput.cs"))
            .Select(ToDiagnostic)
            .ToList();
        var compileMs = compileWatch.ElapsedMilliseconds;
        if (!emit.Success)
            return new RunResult(false, diagnostics, "", false, null, null, compileMs, 0);

        var assembly = Assembly.Load(image.ToArray());
        var output = new LimitedWriter(MaxOutputChars);
        var originalOut = Console.Out;
        var originalError = Console.Error;
        Console.SetOut(output);
        Console.SetError(output);
        assembly.GetType("DevPath.Runtime.LearnerInput")!.GetField("Reader")!.SetValue(null, new StringReader(request.Stdin ?? ""));
        var runWatch = Stopwatch.StartNew();
        string? exception = null;
        List<TestResult>? tests = null;
        try
        {
            if (testing) tests = await RunTestsAsync(assembly);
            else exception = await RunEntryPointAsync(assembly, output);
        }
        finally
        {
            Console.SetOut(originalOut);
            Console.SetError(originalError);
        }
        return new RunResult(true, diagnostics, output.ToString(), output.Truncated, exception, tests, compileMs, runWatch.ElapsedMilliseconds);
    }

    private static SyntaxTree Parse(string code, string path) =>
        CSharpSyntaxTree.ParseText(code, ParseOptions, path, Encoding.UTF8);

    private static RunDiagnostic ToDiagnostic(Diagnostic d)
    {
        var span = d.Location.GetLineSpan();
        return new RunDiagnostic(span.Path, span.StartLinePosition.Line + 1, span.StartLinePosition.Character + 1,
            span.EndLinePosition.Line + 1, span.EndLinePosition.Character + 1,
            d.Severity == DiagnosticSeverity.Error ? "error" : "warning", d.Id, d.GetMessage());
    }

    private static async Task<string?> RunEntryPointAsync(Assembly assembly, LimitedWriter output)
    {
        var entry = assembly.EntryPoint;
        if (entry is null)
        {
            output.WriteLine("(Nothing to run: add top-level statements or a static Main method.)");
            return null;
        }
        try
        {
            var result = entry.Invoke(null, entry.GetParameters().Length == 0 ? null : [Array.Empty<string>()]);
            if (result is Task task) await task;
            return null;
        }
        catch (Exception e)
        {
            return Describe(e);
        }
    }

    private static async Task<List<TestResult>> RunTestsAsync(Assembly assembly)
    {
        var results = new List<TestResult>();
        var testAttribute = assembly.GetType("DevPath.Testing.TestAttribute")!;
        var methods = assembly.GetTypes()
            .SelectMany(t => t.GetMethods(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Static))
            .Select(m => (Method: m, Attribute: m.GetCustomAttribute(testAttribute)))
            .Where(x => x.Attribute is not null)
            .OrderBy(x => x.Method.MetadataToken);
        foreach (var (method, attribute) in methods)
        {
            var name = (string)testAttribute.GetProperty("Name")!.GetValue(attribute)!;
            try
            {
                var result = method.Invoke(null, null);
                if (result is Task task) await task;
                results.Add(new TestResult(name, true, null));
            }
            catch (Exception e)
            {
                var inner = Unwrap(e);
                results.Add(new TestResult(name, false,
                    inner.GetType().Name == "AssertException" ? inner.Message : inner.GetType().Name + ": " + inner.Message));
            }
        }
        return results;
    }

    private static Exception Unwrap(Exception e) =>
        e is TargetInvocationException { InnerException: { } inner } ? Unwrap(inner) : e;

    private static string Describe(Exception e)
    {
        var inner = Unwrap(e);
        // Keep the learner's own frames; the reflection plumbing below them is noise.
        var frames = (inner.StackTrace ?? "").Split('\n')
            .Select(l => l.TrimEnd())
            .TakeWhile(l => !l.Contains("System.Reflection.", StringComparison.Ordinal) && !l.Contains("DevPath.CodeRunner", StringComparison.Ordinal))
            .Where(l => l.Length > 0);
        return inner.GetType().FullName + ": " + inner.Message + "\n" + string.Join("\n", frames);
    }

    /// <summary>Captures console output and stops a runaway program before it fills the browser's memory.</summary>
    private sealed class LimitedWriter(int limit) : StringWriter
    {
        public bool Truncated { get; private set; }

        public override void Write(char value)
        {
            if (GetStringBuilder().Length >= limit)
            {
                Truncated = true;
                throw new InvalidOperationException($"Output limit reached ({limit:N0} characters). Is there an endless loop?");
            }
            base.Write(value);
        }

        public override void Write(string? value)
        {
            if (value is null) return;
            if (GetStringBuilder().Length + value.Length > limit)
            {
                base.Write(value[..Math.Max(0, limit - GetStringBuilder().Length)]);
                Truncated = true;
                throw new InvalidOperationException($"Output limit reached ({limit:N0} characters). Is there an endless loop?");
            }
            base.Write(value);
        }

        public override void Write(char[] buffer, int index, int count) => Write(new string(buffer, index, count));

        public override void WriteLine(string? value) { Write(value); Write(NewLine); }
    }
}
