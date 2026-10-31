using DevPath.Api.DTOs;
using QuestPDF.Drawing;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace DevPath.Api.Services.Cv;

/// <summary>
/// Lays out a CV with QuestPDF. The same layout produces the downloadable PDF (real, selectable text with embedded
/// fonts) and the live preview (the PDF's pages as images), so what the user previews is exactly what they download.
/// Each template has its own structure: single column with a coloured header (modern), plain ATS layout, centred
/// minimalist, two-column technical with a skills sidebar, serif executive, and creative with a full-height sidebar.
/// </summary>
public sealed class CvPdfRenderer
{
    private static readonly object FontLock = new();
    private static bool _fontsReady;

    /// <summary>QuestPDF Community licence (free for individuals and organisations under USD 1M annual revenue) and the embedded Noto fonts.</summary>
    public static void EnsureConfigured(string fontDirectory)
    {
        lock (FontLock)
        {
            if (_fontsReady) return;
            QuestPDF.Settings.License = LicenseType.Community;
            // The layout must not depend on fonts installed on the server.
            QuestPDF.Settings.UseSystemFonts = false;
            // Learners can type any character (emoji, other scripts): render a placeholder instead of failing the export.
            QuestPDF.Settings.ThrowOnMissingTextGlyphs = false;
            foreach (var file in Directory.GetFiles(fontDirectory, "*.ttf"))
                using (var stream = File.OpenRead(file)) FontManager.RegisterFontFromStream(stream);
            _fontsReady = true;
        }
    }

    public byte[] Pdf(CvTemplateDto template, CvContent content, CvStyle style, byte[]? photo, string title) =>
        Build(template, content, style, photo, title).GeneratePdf();

    /// <summary>The pages as WebP images for the live preview.</summary>
    public IReadOnlyList<byte[]> Preview(CvTemplateDto template, CvContent content, CvStyle style, byte[]? photo, int dpi = 100) =>
        Build(template, content, style, photo, "preview").GenerateImages(new ImageGenerationSettings
        {
            ImageFormat = ImageFormat.Webp, ImageCompressionQuality = ImageCompressionQuality.High, RasterDpi = dpi,
        }).ToList();

    private static IDocument Build(CvTemplateDto template, CvContent c, CvStyle s, byte[]? photo, string title)
    {
        var t = new Theme(template, s, photo is { Length: > 0 } && s.ShowPhoto ? photo : null);
        return Document.Create(doc =>
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(x => x.FontFamily(t.Fonts).FontSize(t.Size).FontColor(t.Ink).LineHeight(1.28f));
                switch (template.Key)
                {
                    case CvTemplates.Technical:
                    case CvTemplates.Creative:
                        SidebarPage(page, t, c);
                        break;
                    default:
                        SingleColumnPage(page, t, c);
                        break;
                }
                page.Footer().PaddingHorizontal(t.Margin).PaddingBottom(14).AlignCenter().Text(x =>
                {
                    x.DefaultTextStyle(st => st.FontSize(7.5f).FontColor(Muted));
                    x.CurrentPageNumber(); x.Span(" / "); x.TotalPages();
                });
            });
        }).WithMetadata(new DocumentMetadata { Title = title, Author = c.Personal?.FullName ?? "", Creator = "DevPath CV Builder" });
    }

    // ---------------------------------------------------------------- layouts

    private static void SingleColumnPage(PageDescriptor page, Theme t, CvContent c)
    {
        page.MarginVertical(t.Key == CvTemplates.Modern ? 0 : t.Margin);
        page.MarginHorizontal(t.Key == CvTemplates.Modern ? 0 : t.Margin);
        page.Content().Element(e => t.Rtl ? e.ContentFromRightToLeft() : e).Column(col =>
        {
            col.Item().Element(e => Header(e, t, c));
            col.Item().Element(e => t.Key == CvTemplates.Modern ? e.PaddingHorizontal(t.Margin).PaddingTop(4) : e).Column(body =>
            {
                body.Spacing(t.SectionGap);
                foreach (var key in t.Order) body.Item().Element(e => Section(e, t, c, key, sidebar: false));
            });
        });
    }

    private static void SidebarPage(PageDescriptor page, Theme t, CvContent c)
    {
        const float sidebar = 178;
        page.Margin(0);
        // The sidebar colour runs the full height of every page.
        page.Background().Element(e => t.Rtl ? e.AlignRight() : e.AlignLeft()).Width(sidebar).Background(t.SidebarBg);
        page.Content().Element(e => t.Rtl ? e.ContentFromRightToLeft() : e).Row(row =>
        {
            row.ConstantItem(sidebar).PaddingVertical(t.Margin).PaddingHorizontal(16).Column(side =>
            {
                side.Spacing(t.SectionGap);
                if (t.Photo is not null)
                    side.Item().AlignCenter().Width(96).Height(96).Border(2).BorderColor(t.SidebarInk == "#ffffff" ? "#ffffff" : t.Accent).Image(t.Photo).FitArea();
                side.Item().Element(e => ContactBlock(e, t, c.Personal!));
                foreach (var key in new[] { "skills", "languages" }.Where(t.Order.Contains))
                    side.Item().Element(e => Section(e, t, c, key, sidebar: true));
            });
            row.RelativeItem().PaddingVertical(t.Margin).PaddingHorizontal(22).Column(main =>
            {
                main.Spacing(t.SectionGap);
                main.Item().Element(e => NameBlock(e, t, c.Personal!));
                foreach (var key in t.Order.Where(k => k is not ("skills" or "languages")))
                    main.Item().Element(e => Section(e, t, c, key, sidebar: false));
            });
        });
    }

    // ---------------------------------------------------------------- header

    private static void Header(IContainer container, Theme t, CvContent c)
    {
        var p = c.Personal!;
        switch (t.Key)
        {
            case CvTemplates.Modern:
                container.Column(col =>
                {
                    col.Item().Height(8).Background(t.Accent);
                    col.Item().PaddingHorizontal(t.Margin).PaddingTop(t.Margin - 10).PaddingBottom(12).Row(row =>
                    {
                        row.RelativeItem().Column(info =>
                        {
                            info.Item().Text(Name(p)).FontSize(t.Size + 14).Bold();
                            if (p.Title.Length > 0) info.Item().PaddingTop(2).Text(p.Title).FontSize(t.Size + 3).FontColor(t.Accent).SemiBold();
                            info.Item().PaddingTop(6).Element(e => ContactLine(e, t, p));
                        });
                        if (t.Photo is not null) row.ConstantItem(72).Height(72).Image(t.Photo).FitArea();
                    });
                    col.Item().PaddingHorizontal(t.Margin).LineHorizontal(0.8f).LineColor(Light);
                });
                break;
            case CvTemplates.Minimal:
                container.PaddingBottom(6).Column(col =>
                {
                    col.Item().AlignCenter().Text(Name(p)).FontSize(t.Size + 13).Light().LetterSpacing(0.04f);
                    if (p.Title.Length > 0) col.Item().AlignCenter().PaddingTop(2).Text(p.Title.ToUpperInvariant()).FontSize(t.Size - 0.5f).FontColor(Muted).LetterSpacing(0.15f);
                    col.Item().PaddingTop(8).AlignCenter().Element(e => ContactLine(e, t, p, center: true));
                    col.Item().PaddingTop(12).PaddingHorizontal(140).LineHorizontal(0.5f).LineColor(Light);
                });
                break;
            case CvTemplates.Executive:
                container.PaddingBottom(4).Row(row =>
                {
                    if (t.Photo is not null) row.ConstantItem(70).Height(84).PaddingRight(t.Rtl ? 0 : 14).PaddingLeft(t.Rtl ? 14 : 0).Image(t.Photo).FitArea();
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text(Name(p)).FontSize(t.Size + 15).Bold().FontColor(t.Accent);
                        if (p.Title.Length > 0) col.Item().PaddingTop(2).Text(p.Title.ToUpperInvariant()).FontSize(t.Size).LetterSpacing(0.12f).FontColor(Muted);
                        col.Item().PaddingTop(8).Element(e => ContactLine(e, t, p));
                        col.Item().PaddingTop(10).LineHorizontal(2f).LineColor(t.Accent);
                        col.Item().PaddingTop(2).LineHorizontal(0.6f).LineColor(t.Accent);
                    });
                });
                break;
            default: // ATS: plain, standard, no graphics
                container.PaddingBottom(4).Column(col =>
                {
                    col.Item().Text(Name(p)).FontSize(t.Size + 9).Bold();
                    if (p.Title.Length > 0) col.Item().Text(p.Title).FontSize(t.Size + 1.5f);
                    col.Item().PaddingTop(4).Element(e => ContactLine(e, t, p));
                });
                break;
        }
    }

    private static void NameBlock(IContainer container, Theme t, CvPersonal p) => container.Column(col =>
    {
        col.Item().Text(Name(p)).FontSize(t.Size + 14).Bold().FontColor(t.Key == CvTemplates.Creative ? t.Accent : t.Ink);
        if (p.Title.Length > 0) col.Item().PaddingTop(2).Text(p.Title).FontSize(t.Size + 3).SemiBold()
            .FontColor(t.Key == CvTemplates.Creative ? t.Ink : t.Accent);
        if (t.Key == CvTemplates.Creative) col.Item().PaddingTop(8).Width(46).LineHorizontal(3).LineColor(t.Accent);
    });

    private static string Name(CvPersonal p) => p.FullName.Length > 0 ? p.FullName : "Your Name";

    private static IEnumerable<(string Text, string? Url)> Contacts(CvPersonal p)
    {
        if (p.Email.Length > 0) yield return (p.Email, "mailto:" + p.Email);
        // Left-to-right marks keep "+20 100 …" in order inside a right-to-left (Arabic) CV.
        if (p.Phone.Length > 0) yield return ("‎" + p.Phone + "‎", null);
        if (p.Location.Length > 0) yield return (p.Location, null);
        if (p.LinkedIn.Length > 0) yield return (ShortUrl(p.LinkedIn), p.LinkedIn);
        if (p.GitHub.Length > 0) yield return (ShortUrl(p.GitHub), p.GitHub);
        if (p.Website.Length > 0) yield return (ShortUrl(p.Website), p.Website);
    }

    private static void ContactLine(IContainer container, Theme t, CvPersonal p, bool center = false) => container.Text(x =>
    {
        if (center) x.AlignCenter();
        x.DefaultTextStyle(st => st.FontSize(t.Size - 1).FontColor(t.Key == CvTemplates.Ats ? t.Ink : Muted));
        var first = true;
        foreach (var (text, url) in Contacts(p))
        {
            if (!first) x.Span("  |  ").FontColor(Light);
            first = false;
            if (url is null) x.Span(text); else x.Hyperlink(text, url);
        }
    });

    private static void ContactBlock(IContainer container, Theme t, CvPersonal p) => container.Column(col =>
    {
        col.Spacing(3);
        col.Item().Element(e => SideHeading(e, t, t.Labels.Contact));
        foreach (var (text, url) in Contacts(p))
            col.Item().Text(x =>
            {
                x.DefaultTextStyle(st => st.FontSize(t.Size - 1).FontColor(t.SidebarInk));
                if (url is null) x.Span(text); else x.Hyperlink(text, url);
            });
    });

    // ---------------------------------------------------------------- sections

    private static void Section(IContainer container, Theme t, CvContent c, string key, bool sidebar)
    {
        if (t.Hidden.Contains(key)) return;
        switch (key)
        {
            case "summary" when c.Summary.Length > 0:
                container.Column(col =>
                {
                    col.Item().Element(e => Heading(e, t, t.Labels.Summary));
                    col.Item().Text(c.Summary).FontSize(t.Size).LineHeight(1.35f);
                });
                break;
            case "experience" when c.Experience!.Count > 0:
                container.Column(col =>
                {
                    col.Spacing(t.ItemGap);
                    col.Item().Element(e => Heading(e, t, t.Labels.Experience));
                    foreach (var x in c.Experience!)
                        col.Item().Element(e => Entry(e, t, x.Title, Join(" · ", x.Company, x.Location, x.EmploymentType),
                            Dates(t, x.Start, x.Current ? t.Labels.Present : x.End), x.Responsibilities!, x.Achievements!));
                });
                break;
            case "projects" when c.Projects!.Count > 0:
                container.Column(col =>
                {
                    col.Spacing(t.ItemGap);
                    col.Item().Element(e => Heading(e, t, t.Labels.Projects));
                    foreach (var p in c.Projects!) col.Item().Element(e => Project(e, t, p));
                });
                break;
            case "skills" when c.Skills!.Any(g => g.Items!.Count > 0):
                container.Column(col =>
                {
                    col.Spacing(sidebar ? 6 : 2.5f);
                    col.Item().Element(e => { if (sidebar) SideHeading(e, t, t.Labels.Skills); else Heading(e, t, t.Labels.Skills); });
                    foreach (var g in c.Skills!.Where(g => g.Items!.Count > 0))
                    {
                        if (sidebar)
                            col.Item().Column(group =>
                            {
                                if (g.Category.Length > 0) group.Item().Text(g.Category).FontSize(t.Size - 1).Bold().FontColor(t.SidebarInk);
                                group.Item().Text(string.Join(" · ", g.Items!)).FontSize(t.Size - 1).FontColor(t.SidebarInk);
                            });
                        else
                            col.Item().Text(x =>
                            {
                                if (g.Category.Length > 0) x.Span(g.Category + ": ").Bold();
                                x.Span(string.Join(", ", g.Items!));
                            });
                    }
                });
                break;
            case "education" when c.Education!.Count > 0:
                container.Column(col =>
                {
                    col.Spacing(t.ItemGap);
                    col.Item().Element(e => Heading(e, t, t.Labels.Education));
                    foreach (var x in c.Education!)
                        col.Item().Element(e => Entry(e, t, Join(", ", x.Degree, x.Field), x.Institution, Dates(t, x.Start, x.End),
                            x.Description.Length > 0 ? [x.Description] : [], x.Achievements!, firstListIsParagraph: true));
                });
                break;
            case "certifications" when c.Certifications!.Count > 0:
                container.Column(col =>
                {
                    col.Spacing(t.ItemGap / 1.5f);
                    col.Item().Element(e => Heading(e, t, t.Labels.Certifications));
                    foreach (var x in c.Certifications!)
                        col.Item().Column(item =>
                        {
                            item.Item().Row(row =>
                            {
                                row.RelativeItem().Text(text =>
                                {
                                    text.Span(x.Name).SemiBold();
                                    if (x.Issuer.Length > 0) text.Span(" — " + x.Issuer).FontColor(Muted);
                                });
                                if (x.Date.Length > 0) row.AutoItem().Text(x.Date).FontSize(t.Size - 1).FontColor(Muted);
                            });
                            if (x.Description.Length > 0) item.Item().Text(x.Description).FontSize(t.Size - 0.5f);
                            if (x.Url.Length > 0) item.Item().Text(text => { text.DefaultTextStyle(st => st.FontSize(t.Size - 1.5f).FontColor(t.LinkColor)); text.Hyperlink(ShortUrl(x.Url), x.Url); });
                        });
                });
                break;
            case "languages" when c.Languages!.Count > 0:
                container.Column(col =>
                {
                    col.Spacing(sidebar ? 3 : 2);
                    col.Item().Element(e => { if (sidebar) SideHeading(e, t, t.Labels.Languages); else Heading(e, t, t.Labels.Languages); });
                    if (sidebar)
                        foreach (var l in c.Languages!)
                            col.Item().Text(x =>
                            {
                                x.DefaultTextStyle(st => st.FontSize(t.Size - 1).FontColor(t.SidebarInk));
                                x.Span(l.Name).Bold();
                                if (l.Level.Length > 0) x.Span(" — " + l.Level);
                            });
                    else
                        col.Item().Text(string.Join("   ·   ", c.Languages!.Select(l => l.Level.Length > 0 ? $"{l.Name} ({l.Level})" : l.Name)));
                });
                break;
            case "sections" when c.Sections!.Any(s => s.Items!.Count > 0):
                container.Column(col =>
                {
                    col.Spacing(t.SectionGap);
                    foreach (var s in c.Sections!.Where(s => s.Items!.Count > 0))
                        col.Item().Column(sec =>
                        {
                            sec.Spacing(2);
                            sec.Item().Element(e => Heading(e, t, s.Title.Length > 0 ? s.Title : t.Labels.SectionTitle(s.Kind)));
                            foreach (var item in s.Items!) sec.Item().Element(e => Bullet(e, t, item));
                        });
                });
                break;
        }
    }

    private static void Entry(IContainer container, Theme t, string title, string subtitle, string dates,
        List<string> first, List<string> second, bool firstListIsParagraph = false) => container.Column(col =>
    {
        col.Spacing(1.5f);
        col.Item().Row(row =>
        {
            row.RelativeItem().Text(title.Length > 0 ? title : subtitle).Bold().FontSize(t.Size + (t.Key == CvTemplates.Executive ? 1 : 0.5f));
            if (dates.Length > 0) row.AutoItem().PaddingLeft(t.Rtl ? 0 : 8).PaddingRight(t.Rtl ? 8 : 0)
                .Text(dates).FontSize(t.Size - 1).FontColor(t.Key == CvTemplates.Ats ? t.Ink : Muted);
        });
        if (title.Length > 0 && subtitle.Length > 0)
            col.Item().Text(subtitle).FontSize(t.Size - 0.5f).FontColor(t.Key is CvTemplates.Ats ? t.Ink : t.SubtitleColor).SemiBold();
        if (firstListIsParagraph) foreach (var line in first) col.Item().Text(line).FontSize(t.Size - 0.5f);
        else foreach (var line in first) col.Item().Element(e => Bullet(e, t, line));
        foreach (var line in second) col.Item().Element(e => Bullet(e, t, line, emphasis: t.Key == CvTemplates.Executive));
    });

    private static void Project(IContainer container, Theme t, CvProject p) => container.Column(col =>
    {
        col.Spacing(1.5f);
        col.Item().Row(row =>
        {
            row.RelativeItem().Text(p.Name).Bold().FontSize(t.Size + 0.5f);
            if (p.Date.Length > 0) row.AutoItem().Text(p.Date).FontSize(t.Size - 1).FontColor(t.Key == CvTemplates.Ats ? t.Ink : Muted);
        });
        if (p.Technologies!.Count > 0)
            col.Item().Text(string.Join(" · ", p.Technologies!)).FontSize(t.Size - 1).FontColor(t.Key == CvTemplates.Ats ? t.Ink : t.SubtitleColor).SemiBold();
        if (p.Description.Length > 0) col.Item().Text(p.Description).FontSize(t.Size - 0.5f);
        foreach (var h in p.Highlights!) col.Item().Element(e => Bullet(e, t, h));
        if (p.RepoUrl.Length > 0 || p.DemoUrl.Length > 0)
            col.Item().Text(x =>
            {
                x.DefaultTextStyle(st => st.FontSize(t.Size - 1.5f).FontColor(t.LinkColor));
                if (p.RepoUrl.Length > 0) x.Hyperlink(ShortUrl(p.RepoUrl), p.RepoUrl);
                if (p.RepoUrl.Length > 0 && p.DemoUrl.Length > 0) x.Span("   ");
                if (p.DemoUrl.Length > 0) x.Hyperlink(ShortUrl(p.DemoUrl), p.DemoUrl);
            });
    });

    private static void Bullet(IContainer container, Theme t, string text, bool emphasis = false) => container.Row(row =>
    {
        row.ConstantItem(11).Text(t.Key == CvTemplates.Ats ? "-" : "•").FontColor(t.Key == CvTemplates.Ats ? t.Ink : t.Accent);
        var span = row.RelativeItem().Text(text).FontSize(t.Size - 0.5f);
        if (emphasis) span.SemiBold();
    });

    private static void Heading(IContainer container, Theme t, string text)
    {
        switch (t.Key)
        {
            case CvTemplates.Ats:
                container.PaddingBottom(3).Column(col =>
                {
                    col.Item().Text(text.ToUpperInvariant()).Bold().FontSize(t.Size + 1);
                    col.Item().PaddingTop(1).LineHorizontal(0.75f).LineColor(t.Ink);
                });
                break;
            case CvTemplates.Minimal:
                container.PaddingBottom(4).Text(text.ToUpperInvariant()).FontSize(t.Size - 1).LetterSpacing(0.2f).FontColor(t.Accent).SemiBold();
                break;
            case CvTemplates.Executive:
                container.PaddingBottom(4).Column(col =>
                {
                    col.Item().Text(text).Bold().FontSize(t.Size + 3).FontColor(t.Accent);
                    col.Item().PaddingTop(1).LineHorizontal(0.6f).LineColor(Light);
                });
                break;
            case CvTemplates.Technical:
                container.PaddingBottom(3).Row(row =>
                {
                    row.ConstantItem(4).Height(t.Size + 4).Background(t.Accent);
                    row.RelativeItem().PaddingLeft(t.Rtl ? 0 : 7).PaddingRight(t.Rtl ? 7 : 0).Text(text).Bold().FontSize(t.Size + 2);
                });
                break;
            case CvTemplates.Creative:
                container.PaddingBottom(3).Row(row =>
                {
                    row.ConstantItem(7).AlignMiddle().Height(7).Background(t.Accent);
                    row.RelativeItem().PaddingLeft(t.Rtl ? 0 : 7).PaddingRight(t.Rtl ? 7 : 0)
                        .Text(text.ToUpperInvariant()).Bold().FontSize(t.Size + 1.5f).LetterSpacing(0.05f);
                });
                break;
            default: // modern
                container.PaddingBottom(3).Column(col =>
                {
                    col.Item().Text(text.ToUpperInvariant()).Bold().FontSize(t.Size + 1).FontColor(t.Accent).LetterSpacing(0.06f);
                    col.Item().PaddingTop(2).LineHorizontal(1.2f).LineColor(t.Accent);
                });
                break;
        }
    }

    private static void SideHeading(IContainer container, Theme t, string text) =>
        container.PaddingBottom(2).Text(text.ToUpperInvariant()).Bold().FontSize(t.Size - 0.5f).LetterSpacing(0.12f)
            .FontColor(t.Key == CvTemplates.Creative ? t.SidebarInk : t.Accent);

    // ---------------------------------------------------------------- helpers

    private const string Muted = "#5b6472";
    private const string Light = "#cfd5dd";

    private static string Join(string separator, params string[] parts) => string.Join(separator, parts.Where(p => p.Length > 0));

    private static string Dates(Theme t, string start, string end) =>
        start.Length > 0 && end.Length > 0 ? $"{start} – {end}" : start.Length > 0 ? start : end;

    private static string ShortUrl(string url) =>
        url.Replace("https://", "").Replace("http://", "").Replace("www.", "").TrimEnd('/');

    /// <summary>A lighter tint of the accent for backgrounds (mixed with white).</summary>
    private static string Tint(string hex, double amount)
    {
        int Channel(int i) => (int)Math.Round(255 - (255 - Convert.ToInt32(hex.Substring(i, 2), 16)) * amount);
        return $"#{Channel(1):x2}{Channel(3):x2}{Channel(5):x2}";
    }

    private sealed class Theme
    {
        public Theme(CvTemplateDto template, CvStyle style, byte[]? photo)
        {
            Key = template.Key;
            Accent = template.Key == CvTemplates.Ats ? "#111111" : style.Accent;
            Rtl = style.Direction == "rtl";
            Fonts = style.Font switch
            {
                "serif" => ["Noto Serif", "Noto Naskh Arabic", "Noto Sans"],
                "lato" => ["Lato", "Noto Sans Arabic", "Noto Sans"],
                _ => ["Noto Sans", "Noto Sans Arabic"],
            };
            if (Rtl) Fonts = [Fonts[1], .. Fonts.Where((_, i) => i != 1)];
            var compact = style.Density == "compact";
            Size = compact ? 9.2f : 10f;
            SectionGap = compact ? 9 : 13;
            ItemGap = compact ? 5 : 7;
            Margin = compact ? 30 : 38;
            Order = style.SectionOrder!;
            Hidden = [.. style.Hidden!];
            Photo = template.SupportsPhoto ? photo : null;
            Labels = Rtl ? CvLabels.Arabic : CvLabels.English;
            SidebarBg = template.Key == CvTemplates.Creative ? Accent : Tint(Accent, 0.09);
            SidebarInk = template.Key == CvTemplates.Creative ? "#ffffff" : Ink;
            SubtitleColor = template.Key is CvTemplates.Minimal ? Muted : Accent;
            LinkColor = template.Key == CvTemplates.Ats ? Ink : Accent;
        }

        public string Key { get; }
        public string Accent { get; }
        public string Ink { get; } = "#1f2933";
        public string SidebarBg { get; }
        public string SidebarInk { get; }
        public string SubtitleColor { get; }
        public string LinkColor { get; }
        public bool Rtl { get; }
        public string[] Fonts { get; }
        public float Size { get; }
        public float SectionGap { get; }
        public float ItemGap { get; }
        public float Margin { get; }
        public IReadOnlyList<string> Order { get; }
        public HashSet<string> Hidden { get; }
        public byte[]? Photo { get; }
        public CvLabels Labels { get; }
    }
}

/// <summary>Section headings in the CV's own language (its direction decides English or Arabic).</summary>
public sealed record CvLabels(
    string Summary, string Experience, string Projects, string Skills, string Education, string Certifications,
    string Languages, string Contact, string Present, IReadOnlyDictionary<string, string> Sections)
{
    public string SectionTitle(string kind) => Sections.TryGetValue(kind, out var title) ? title : Sections["custom"];

    public static readonly CvLabels English = new("Professional Summary", "Work Experience", "Projects", "Technical Skills", "Education",
        "Certifications & Courses", "Languages", "Contact", "Present", new Dictionary<string, string>
        {
            ["achievements"] = "Achievements", ["volunteer"] = "Volunteer Experience", ["publications"] = "Publications",
            ["coursework"] = "Relevant Coursework", ["opensource"] = "Open Source Contributions", ["interests"] = "Interests", ["custom"] = "Additional Information",
        });

    public static readonly CvLabels Arabic = new("الملخص المهني", "الخبرة العملية", "المشاريع", "المهارات التقنية", "التعليم",
        "الشهادات والدورات", "اللغات", "التواصل", "حتى الآن", new Dictionary<string, string>
        {
            ["achievements"] = "الإنجازات", ["volunteer"] = "العمل التطوعي", ["publications"] = "المنشورات",
            ["coursework"] = "مقررات ذات صلة", ["opensource"] = "المساهمات مفتوحة المصدر", ["interests"] = "الاهتمامات", ["custom"] = "معلومات إضافية",
        });
}
