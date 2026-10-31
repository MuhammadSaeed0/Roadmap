using DevPath.Api.DTOs;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace DevPath.Api.Services.Cv;

/// <summary>
/// Writes a CV as a genuine, editable Word document (Office Open XML): real heading styles, bullet lists, tab-aligned
/// dates and hyperlinks, in the template's fonts and colours. Word documents use one column for every template, so
/// the file stays easy to edit; right-to-left paragraphs are used for Arabic CVs.
/// </summary>
public sealed class CvDocxRenderer
{
    private const int BulletNumberingId = 1;

    public byte[] Docx(CvTemplateDto template, CvContent c, CvStyle s, string title)
    {
        var t = new Look(template, s);
        using var stream = new MemoryStream();
        using (var doc = WordprocessingDocument.Create(stream, WordprocessingDocumentType.Document))
        {
            doc.PackageProperties.Title = title;
            doc.PackageProperties.Creator = c.Personal!.FullName;
            var main = doc.AddMainDocumentPart();
            main.Document = new Document(new Body());
            AddStyles(main, t);
            AddNumbering(main);
            var body = main.Document.Body!;
            var w = new Writer(main, body, t);

            Header(w, t, c.Personal!);
            foreach (var key in s.SectionOrder!)
                if (!s.Hidden!.Contains(key)) Section(w, t, c, key);

            var section = new SectionProperties(
                new PageSize { Width = 11906, Height = 16838 },   // A4 in twentieths of a point
                new PageMargin { Top = 1020, Bottom = 1020, Left = 1077, Right = 1077, Header = 567, Footer = 567, Gutter = 0 });
            if (t.Rtl) section.Append(new BiDi());
            body.Append(section);
            InSchemaOrder(main.Document);
            main.Document.Save();
        }
        return stream.ToArray();
    }

    // ---------------------------------------------------------------- content

    private static void Header(Writer w, Look t, CvPersonal p)
    {
        var center = t.Key == CvTemplates.Minimal;
        w.Paragraph("CvName", center, (p.FullName.Length > 0 ? p.FullName : "Your Name", Emphasis.Plain));
        if (p.Title.Length > 0) w.Paragraph("CvRole", center, (p.Title, Emphasis.Plain));
        var parts = new List<(string Text, string? Url)>();
        if (p.Email.Length > 0) parts.Add((p.Email, "mailto:" + p.Email));
        if (p.Phone.Length > 0) parts.Add((p.Phone, null));
        if (p.Location.Length > 0) parts.Add((p.Location, null));
        if (p.LinkedIn.Length > 0) parts.Add((p.LinkedIn, p.LinkedIn));
        if (p.GitHub.Length > 0) parts.Add((p.GitHub, p.GitHub));
        if (p.Website.Length > 0) parts.Add((p.Website, p.Website));
        if (parts.Count > 0) w.ContactParagraph(parts, center);
    }

    private static void Section(Writer w, Look t, CvContent c, string key)
    {
        var l = t.Labels;
        switch (key)
        {
            case "summary" when c.Summary.Length > 0:
                w.Heading(l.Summary);
                w.Paragraph("CvBody", false, (c.Summary, Emphasis.Plain));
                break;
            case "experience" when c.Experience!.Count > 0:
                w.Heading(l.Experience);
                foreach (var x in c.Experience!)
                {
                    w.EntryTitle(x.Title.Length > 0 ? x.Title : x.Company, Dates(x.Start, x.Current ? l.Present : x.End));
                    var sub = Join(" · ", x.Title.Length > 0 ? x.Company : "", x.Location, x.EmploymentType);
                    if (sub.Length > 0) w.Paragraph("CvSubtitle", false, (sub, Emphasis.Plain));
                    foreach (var r in x.Responsibilities!) w.Bullet(r);
                    foreach (var a in x.Achievements!) w.Bullet(a, bold: t.Key == CvTemplates.Executive);
                }
                break;
            case "projects" when c.Projects!.Count > 0:
                w.Heading(l.Projects);
                foreach (var p in c.Projects!)
                {
                    w.EntryTitle(p.Name, p.Date);
                    if (p.Technologies!.Count > 0) w.Paragraph("CvSubtitle", false, (string.Join(" · ", p.Technologies!), Emphasis.Plain));
                    if (p.Description.Length > 0) w.Paragraph("CvBody", false, (p.Description, Emphasis.Plain));
                    foreach (var h in p.Highlights!) w.Bullet(h);
                    var links = new List<(string, string?)>();
                    if (p.RepoUrl.Length > 0) links.Add((p.RepoUrl, p.RepoUrl));
                    if (p.DemoUrl.Length > 0) links.Add((p.DemoUrl, p.DemoUrl));
                    if (links.Count > 0) w.ContactParagraph(links, false);
                }
                break;
            case "skills" when c.Skills!.Any(g => g.Items!.Count > 0):
                w.Heading(l.Skills);
                foreach (var g in c.Skills!.Where(g => g.Items!.Count > 0))
                    w.Paragraph("CvBody", false, g.Category.Length > 0 ? (g.Category + ": ", Emphasis.Bold) : ("", Emphasis.Plain),
                        (string.Join(", ", g.Items!), Emphasis.Plain));
                break;
            case "education" when c.Education!.Count > 0:
                w.Heading(l.Education);
                foreach (var x in c.Education!)
                {
                    w.EntryTitle(Join(", ", x.Degree, x.Field) is { Length: > 0 } degree ? degree : x.Institution, Dates(x.Start, x.End));
                    if (Join(", ", x.Degree, x.Field).Length > 0 && x.Institution.Length > 0) w.Paragraph("CvSubtitle", false, (x.Institution, Emphasis.Plain));
                    if (x.Description.Length > 0) w.Paragraph("CvBody", false, (x.Description, Emphasis.Plain));
                    foreach (var a in x.Achievements!) w.Bullet(a);
                }
                break;
            case "certifications" when c.Certifications!.Count > 0:
                w.Heading(l.Certifications);
                foreach (var x in c.Certifications!)
                {
                    w.EntryTitle(x.Issuer.Length > 0 ? $"{x.Name} — {x.Issuer}" : x.Name, x.Date);
                    if (x.Description.Length > 0) w.Paragraph("CvBody", false, (x.Description, Emphasis.Plain));
                    if (x.Url.Length > 0) w.ContactParagraph([(x.Url, x.Url)], false);
                }
                break;
            case "languages" when c.Languages!.Count > 0:
                w.Heading(l.Languages);
                w.Paragraph("CvBody", false, (string.Join("  ·  ", c.Languages!.Select(x => x.Level.Length > 0 ? $"{x.Name} ({x.Level})" : x.Name)), Emphasis.Plain));
                break;
            case "sections":
                foreach (var s in c.Sections!.Where(s => s.Items!.Count > 0))
                {
                    w.Heading(s.Title.Length > 0 ? s.Title : l.SectionTitle(s.Kind));
                    foreach (var item in s.Items!) w.Bullet(item);
                }
                break;
        }
    }

    private static string Join(string separator, params string[] parts) => string.Join(separator, parts.Where(p => p.Length > 0));
    private static string Dates(string start, string end) =>
        start.Length > 0 && end.Length > 0 ? $"{start} – {end}" : start.Length > 0 ? start : end;

    // ---------------------------------------------------------------- styles and numbering

    private static void AddStyles(MainDocumentPart main, Look t)
    {
        var part = main.AddNewPart<StyleDefinitionsPart>();
        RunFonts Fonts() => new() { Ascii = t.Font, HighAnsi = t.Font, EastAsia = t.Font, ComplexScript = "Arial" };
        Style ParaStyle(string id, string name, int sizeHalfPoints, string color, bool bold, int before, int after, bool center = false,
            ParagraphBorders? borders = null, bool caps = false, int spacing = 0)
        {
            var rpr = new StyleRunProperties(Fonts(), new Color { Val = color }, new FontSize { Val = sizeHalfPoints.ToString() },
                new FontSizeComplexScript { Val = sizeHalfPoints.ToString() });
            if (bold) { rpr.Append(new Bold()); rpr.Append(new BoldComplexScript()); }
            if (caps) rpr.Append(new Caps());
            if (spacing != 0) rpr.Append(new Spacing { Val = spacing });
            var ppr = new StyleParagraphProperties(new SpacingBetweenLines { Before = before.ToString(), After = after.ToString(), Line = "264", LineRule = LineSpacingRuleValues.Auto });
            if (borders is not null) ppr.Append(borders);
            if (center) ppr.Append(new Justification { Val = JustificationValues.Center });
            if (t.Rtl) ppr.Append(new BiDi());
            return new Style(new StyleName { Val = name }, new BasedOn { Val = "Normal" }, new PrimaryStyle(), ppr, rpr)
            { Type = StyleValues.Paragraph, StyleId = id, CustomStyle = true };
        }

        var heading = t.Key switch
        {
            CvTemplates.Ats => ParaStyle("CvHeading", "CV Heading", 23, "000000", true, 220, 60, caps: true,
                borders: new ParagraphBorders(new BottomBorder { Val = BorderValues.Single, Size = 6, Color = "000000", Space = 1 })),
            CvTemplates.Minimal => ParaStyle("CvHeading", "CV Heading", 18, t.AccentHex, true, 260, 80, caps: true, spacing: 30),
            CvTemplates.Executive => ParaStyle("CvHeading", "CV Heading", 26, t.AccentHex, true, 240, 80,
                borders: new ParagraphBorders(new BottomBorder { Val = BorderValues.Single, Size = 4, Color = "BFC5CE", Space = 1 })),
            _ => ParaStyle("CvHeading", "CV Heading", 22, t.AccentHex, true, 240, 80, caps: true,
                borders: new ParagraphBorders(new BottomBorder { Val = BorderValues.Single, Size = 8, Color = t.AccentHex, Space = 1 })),
        };
        heading.StyleParagraphProperties!.Append(new OutlineLevel { Val = 0 });

        part.Styles = new Styles(
            new DocDefaults(
                new RunPropertiesDefault(new RunPropertiesBaseStyle(Fonts(), new FontSize { Val = "20" }, new FontSizeComplexScript { Val = "20" },
                    new Color { Val = "1F2933" }, new Languages { Val = t.Rtl ? "ar-EG" : "en-US", Bidi = "ar-EG" })),
                new ParagraphPropertiesDefault(new ParagraphPropertiesBaseStyle(new SpacingBetweenLines { After = "40", Line = "264", LineRule = LineSpacingRuleValues.Auto }))),
            new Style(new StyleName { Val = "Normal" }, new PrimaryStyle()) { Type = StyleValues.Paragraph, StyleId = "Normal", Default = true },
            ParaStyle("CvName", "CV Name", t.Key == CvTemplates.Ats ? 40 : 52, t.Key is CvTemplates.Executive or CvTemplates.Creative ? t.AccentHex : "1F2933",
                true, 0, 20, center: t.Key == CvTemplates.Minimal),
            ParaStyle("CvRole", "CV Role", 26, t.Key is CvTemplates.Ats or CvTemplates.Minimal ? "4B5563" : t.AccentHex, t.Key != CvTemplates.Ats, 0, 60,
                center: t.Key == CvTemplates.Minimal, caps: t.Key is CvTemplates.Executive or CvTemplates.Minimal),
            ParaStyle("CvContact", "CV Contact", 18, t.Key == CvTemplates.Ats ? "1F2933" : "5B6472", false, 0, 120, center: t.Key == CvTemplates.Minimal),
            heading,
            ParaStyle("CvEntry", "CV Entry", 21, "1F2933", true, 120, 0),
            ParaStyle("CvSubtitle", "CV Subtitle", 19, t.Key is CvTemplates.Ats or CvTemplates.Minimal ? "4B5563" : t.AccentHex, t.Key != CvTemplates.Ats, 0, 20),
            ParaStyle("CvBody", "CV Body", 20, "1F2933", false, 0, 40),
            new Style(new StyleName { Val = "Hyperlink" }, new UIPriority { Val = 99 },
                new StyleRunProperties(new Color { Val = t.Key == CvTemplates.Ats ? "1F2933" : t.AccentHex }, new Underline { Val = UnderlineValues.Single }))
            { Type = StyleValues.Character, StyleId = "Hyperlink" });
        InSchemaOrder(part.Styles);
        part.Styles.Save();
    }

    private static void AddNumbering(MainDocumentPart main)
    {
        var part = main.AddNewPart<NumberingDefinitionsPart>();
        part.Numbering = new Numbering(
            new AbstractNum(
                new MultiLevelType { Val = MultiLevelValues.HybridMultilevel },
                new Level(
                    new StartNumberingValue { Val = 1 },
                    new NumberingFormat { Val = NumberFormatValues.Bullet },
                    new LevelText { Val = "•" },
                    new LevelJustification { Val = LevelJustificationValues.Left },
                    new PreviousParagraphProperties(new Indentation { Left = "360", Hanging = "240" }),
                    new NumberingSymbolRunProperties(new RunFonts { Ascii = "Arial", HighAnsi = "Arial", Hint = FontTypeHintValues.Default }))
                { LevelIndex = 0 })
            { AbstractNumberId = 1 },
            new NumberingInstance(new AbstractNumId { Val = 1 }) { NumberID = BulletNumberingId });
        InSchemaOrder(part.Numbering);
        part.Numbering.Save();
    }

    // ---------------------------------------------------------------- writer

    // Word rejects a file whose formatting elements are out of the order the schema defines, so the properties
    // built above (in whatever order was convenient) are sorted before saving.
    private static readonly string[] ParagraphOrder =
    [
        "pStyle", "keepNext", "keepLines", "pageBreakBefore", "framePr", "widowControl", "numPr", "suppressLineNumbers", "pBdr", "shd",
        "tabs", "suppressAutoHyphens", "kinsoku", "wordWrap", "overflowPunct", "topLinePunct", "autoSpaceDE", "autoSpaceDN", "bidi",
        "adjustRightInd", "snapToGrid", "spacing", "ind", "contextualSpacing", "mirrorIndents", "suppressOverlap", "jc", "textDirection",
        "textAlignment", "textboxTightWrap", "outlineLvl", "divId", "cnfStyle", "rPr", "sectPr", "pPrChange",
    ];
    private static readonly string[] RunOrder =
    [
        "rStyle", "rFonts", "b", "bCs", "i", "iCs", "caps", "smallCaps", "strike", "dstrike", "outline", "shadow", "emboss", "imprint",
        "noProof", "snapToGrid", "vanish", "webHidden", "color", "spacing", "w", "kern", "position", "sz", "szCs", "highlight", "u",
        "effect", "bdr", "shd", "fitText", "vertAlign", "rtl", "cs", "em", "lang", "eastAsianLayout", "specVanish", "oMath",
    ];
    private static readonly string[] StyleOrder =
    [
        "name", "aliases", "basedOn", "next", "link", "autoRedefine", "hidden", "uiPriority", "semiHidden", "unhideWhenUsed", "qFormat",
        "locked", "personal", "personalCompose", "personalReply", "rsid", "pPr", "rPr", "tblPr", "trPr", "tcPr", "tblStylePr",
    ];

    private static void InSchemaOrder(OpenXmlElement root)
    {
        foreach (var element in root.Descendants().Prepend(root).ToList())
        {
            var order = element switch
            {
                ParagraphProperties or StyleParagraphProperties or ParagraphPropertiesBaseStyle => ParagraphOrder,
                RunProperties or StyleRunProperties or RunPropertiesBaseStyle or NumberingSymbolRunProperties => RunOrder,
                Style => StyleOrder,
                _ => null,
            };
            if (order is null) continue;
            var sorted = element.ChildElements
                .OrderBy(c => Array.IndexOf(order, c.LocalName) is var i and >= 0 ? i : int.MaxValue)   // stable sort
                .ToList();
            element.RemoveAllChildren();
            foreach (var child in sorted) element.AppendChild(child);
        }
    }

    private enum Emphasis { Plain, Bold }

    private sealed class Writer(MainDocumentPart main, Body body, Look look)
    {
        private Paragraph New(string style, bool center = false)
        {
            var ppr = new ParagraphProperties(new ParagraphStyleId { Val = style });
            if (look.Rtl) ppr.Append(new BiDi());
            if (center) ppr.Append(new Justification { Val = JustificationValues.Center });
            return new Paragraph(ppr);
        }

        private Run Run(string text, bool bold = false)
        {
            var rpr = new RunProperties();
            if (bold) { rpr.Append(new Bold()); rpr.Append(new BoldComplexScript()); }
            if (look.Rtl) rpr.Append(new RightToLeftText());
            return new Run(rpr, new Text(text) { Space = SpaceProcessingModeValues.Preserve });
        }

        public void Paragraph(string style, bool center, params (string Text, Emphasis Style)[] runs)
        {
            var p = New(style, center);
            foreach (var (text, style2) in runs.Where(r => r.Text.Length > 0)) p.Append(Run(text, style2 == Emphasis.Bold));
            body.Append(p);
        }

        public void Heading(string text) => Paragraph("CvHeading", false, (text, Emphasis.Plain));

        /// <summary>Bold title with the dates on a right-aligned tab stop.</summary>
        public void EntryTitle(string title, string dates)
        {
            var p = New("CvEntry");
            p.ParagraphProperties!.Append(new Tabs(new TabStop { Val = TabStopValues.Right, Position = 9746 }));
            p.Append(Run(title));
            if (dates.Length > 0)
            {
                p.Append(new Run(new TabChar()));
                var r = Run(dates);
                r.RunProperties!.Append(new Bold { Val = false });
                r.RunProperties.Append(new BoldComplexScript { Val = false });
                r.RunProperties.Append(new Color { Val = "5B6472" });
                r.RunProperties.Append(new FontSize { Val = "18" });
                p.Append(r);
            }
            body.Append(p);
        }

        public void Bullet(string text, bool bold = false)
        {
            var p = New("CvBody");
            p.ParagraphProperties!.Append(new NumberingProperties(new NumberingLevelReference { Val = 0 }, new NumberingId { Val = BulletNumberingId }));
            p.ParagraphProperties.Append(new SpacingBetweenLines { After = "20" });
            p.Append(Run(text, bold));
            body.Append(p);
        }

        public void ContactParagraph(IReadOnlyList<(string Text, string? Url)> parts, bool center)
        {
            var p = New("CvContact", center);
            for (var i = 0; i < parts.Count; i++)
            {
                if (i > 0) p.Append(Run("  |  "));
                var (text, url) = parts[i];
                if (url is not null && Uri.TryCreate(url, UriKind.Absolute, out var uri))
                {
                    var rel = main.AddHyperlinkRelationship(uri, true);
                    var run = Run(text.Replace("mailto:", ""));
                    run.RunProperties!.Append(new RunStyle { Val = "Hyperlink" });
                    p.Append(new Hyperlink(run) { Id = rel.Id, History = true });
                }
                else p.Append(Run(text));
            }
            body.Append(p);
        }
    }

    private sealed class Look(CvTemplateDto template, CvStyle style)
    {
        public string Key { get; } = template.Key;
        public bool Rtl { get; } = style.Direction == "rtl";
        public string AccentHex { get; } = (template.Key == CvTemplates.Ats ? "#111111" : style.Accent).TrimStart('#').ToUpperInvariant();
        /// <summary>Word uses fonts installed on the reader's computer, so the template fonts map to common ones.</summary>
        public string Font { get; } = style.Font switch { "serif" => "Cambria", "lato" => "Calibri", _ => "Calibri" };
        public CvLabels Labels { get; } = style.Direction == "rtl" ? CvLabels.Arabic : CvLabels.English;
    }
}
