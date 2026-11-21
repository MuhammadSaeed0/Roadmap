using System.Net;
using System.Text.RegularExpressions;

namespace DevPath.Api.Tests;

/// <summary>
/// Link previews on Facebook, WhatsApp and X come from static Open Graph tags in the Angular index.html (crawlers
/// don't run the app) and the image public/og-image.jpg, which the deployed API must serve without signing in.
/// </summary>
public class SocialPreviewTests : IAsyncLifetime
{
    private static readonly string Frontend = FindFrontend();
    private readonly string _webRoot = Directory.CreateTempSubdirectory("devpath-og-").FullName;
    private HostingTests.WebRootFactory _factory = null!;

    public async Task InitializeAsync()
    {
        File.Copy(Path.Combine(Frontend, "src", "index.html"), Path.Combine(_webRoot, "index.html"));
        File.Copy(Path.Combine(Frontend, "public", "og-image.jpg"), Path.Combine(_webRoot, "og-image.jpg"));
        _factory = new HostingTests.WebRootFactory(_webRoot);
        await _factory.InitializeAsync();
    }

    public async Task DisposeAsync()
    {
        await ((IAsyncLifetime)_factory).DisposeAsync();
        Directory.Delete(_webRoot, recursive: true);
    }

    [Fact]
    public async Task The_preview_image_is_public_jpeg_1200_by_630_and_small()
    {
        var response = await _factory.CreateClient().GetAsync("/og-image.jpg");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("image/jpeg", response.Content.Headers.ContentType?.MediaType);

        var bytes = await response.Content.ReadAsByteArrayAsync();
        Assert.True(bytes.Length < 300 * 1024, $"og-image.jpg is {bytes.Length / 1024} KB; keep it under 300 KB");
        Assert.Equal((1200, 630), JpegSize(bytes));
    }

    [Fact]
    public async Task The_home_page_carries_the_open_graph_tags()
    {
        var html = await _factory.CreateClient().GetStringAsync("/");
        string? Meta(string key) =>
            Regex.Match(html, $"<meta (?:property|name)=\"{Regex.Escape(key)}\" content=\"([^\"]*)\"") is { Success: true } m ? m.Groups[1].Value : null;

        foreach (var key in new[] { "og:type", "og:site_name", "og:title", "og:description", "og:url", "og:image", "twitter:card" })
            Assert.False(string.IsNullOrWhiteSpace(Meta(key)), $"missing {key}");
        Assert.Equal("https://dotnetfullstackroadmap.runasp.net/og-image.jpg", Meta("og:image"));
        Assert.Equal("1200", Meta("og:image:width"));
        Assert.Equal("630", Meta("og:image:height"));
        Assert.Equal("ar_EG", Meta("og:locale"));
        Assert.Equal("en_US", Meta("og:locale:alternate"));
        Assert.Equal("summary_large_image", Meta("twitter:card"));
        Assert.Matches(@"[؀-ۿ]", Meta("og:title")!);
        // .NET inside Arabic text needs a left-to-right mark, or the dot shows on the wrong side.
        Assert.Contains("‎.NET", Meta("og:description")!);
    }

    /// <summary>Width and height from the first start-of-frame marker of a JPEG.</summary>
    private static (int Width, int Height) JpegSize(byte[] b)
    {
        for (var i = 2; i + 8 < b.Length;)
        {
            if (b[i] != 0xFF) { i++; continue; }
            var marker = b[i + 1];
            var length = (b[i + 2] << 8) | b[i + 3];
            if (marker is >= 0xC0 and <= 0xCF and not 0xC4 and not 0xC8 and not 0xCC)
                return ((b[i + 7] << 8) | b[i + 8], (b[i + 5] << 8) | b[i + 6]);
            i += 2 + length;
        }
        throw new InvalidDataException("No JPEG frame header found.");
    }

    private static string FindFrontend()
    {
        for (var dir = new DirectoryInfo(AppContext.BaseDirectory); dir is not null; dir = dir.Parent)
        {
            var candidate = Path.Combine(dir.FullName, "frontend");
            if (File.Exists(Path.Combine(candidate, "src", "index.html"))) return candidate;
        }
        throw new DirectoryNotFoundException("frontend/ not found above the test output folder.");
    }
}
