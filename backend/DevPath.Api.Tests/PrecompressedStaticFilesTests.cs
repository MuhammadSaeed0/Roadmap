using DevPath.Api.Middleware;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;

namespace DevPath.Api.Tests;

/// <summary>Brotli copies of static files, including conditional requests (the code runners revalidate their cached files).</summary>
public sealed class PrecompressedStaticFilesTests : IDisposable
{
    private readonly string _root = Directory.CreateTempSubdirectory("devpath-static-").FullName;

    public PrecompressedStaticFilesTests()
    {
        Directory.CreateDirectory(Path.Combine(_root, "runners", "sql"));
        File.WriteAllBytes(Path.Combine(_root, "runners", "sql", "sql-wasm.wasm"), new byte[100]);
        File.WriteAllBytes(Path.Combine(_root, "runners", "sql", "sql-wasm.wasm.br"), new byte[40]);
    }

    public void Dispose() => Directory.Delete(_root, recursive: true);

    private async Task<HttpContext> Get(Action<HttpRequest>? setup = null)
    {
        var context = new DefaultHttpContext();
        context.Request.Method = "GET";
        context.Request.Path = "/runners/sql/sql-wasm.wasm";
        context.Request.Headers.AcceptEncoding = "gzip, br";
        context.Response.Body = new MemoryStream();
        setup?.Invoke(context.Request);
        var nextCalled = false;
        var middleware = new PrecompressedStaticFiles(_ => { nextCalled = true; return Task.CompletedTask; }, new Environment(_root), new FileExtensionContentTypeProvider());
        await middleware.InvokeAsync(context);
        Assert.False(nextCalled);
        return context;
    }

    [Fact]
    public async Task Serves_the_brotli_copy_with_validators()
    {
        var response = (await Get()).Response;
        Assert.Equal(200, response.StatusCode);
        Assert.Equal("br", response.Headers.ContentEncoding);
        Assert.Equal(40, response.ContentLength);
        Assert.False(string.IsNullOrEmpty(response.Headers.ETag));
        Assert.False(string.IsNullOrEmpty(response.Headers.LastModified));
    }

    [Fact]
    public async Task Answers_conditional_requests_with_304()
    {
        var first = (await Get()).Response;
        var byEtag = (await Get(r => r.Headers.IfNoneMatch = first.Headers.ETag.ToString())).Response;
        Assert.Equal(304, byEtag.StatusCode);
        Assert.Equal(0, byEtag.Body.Length);

        var byDate = (await Get(r => r.Headers.IfModifiedSince = first.Headers.LastModified.ToString())).Response;
        Assert.Equal(304, byDate.StatusCode);

        var changed = (await Get(r => r.Headers.IfNoneMatch = "\"something-else\"")).Response;
        Assert.Equal(200, changed.StatusCode);
        Assert.Equal(40, changed.Body.Length);
    }

    private sealed class Environment(string root) : IWebHostEnvironment
    {
        public string WebRootPath { get; set; } = root;
        public IFileProvider WebRootFileProvider { get; set; } = new PhysicalFileProvider(root);
        public string ApplicationName { get; set; } = "Test";
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
        public string ContentRootPath { get; set; } = root;
        public string EnvironmentName { get; set; } = "Testing";
    }
}
