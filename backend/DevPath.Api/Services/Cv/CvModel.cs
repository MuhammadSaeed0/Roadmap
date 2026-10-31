using System.Text.Json;
using System.Text.RegularExpressions;
using DevPath.Api.DTOs;

namespace DevPath.Api.Services.Cv;

/// <summary>The CV templates. Each one is laid out differently by <see cref="CvPdfRenderer"/>, not just recoloured.</summary>
public static class CvTemplates
{
    public const string Modern = "modern", Ats = "ats", Minimal = "minimal", Technical = "technical", Executive = "executive", Creative = "creative";

    public static readonly IReadOnlyList<CvTemplateDto> All =
    [
        new(Modern, "Modern Professional", "احترافي حديث",
            "A clean single column with a coloured header, clear hierarchy and balanced spacing.",
            "عمود واحد نظيف برأس ملوّن وتسلسل واضح ومسافات متوازنة.",
            "#2563eb", "sans", true, true, false, ["summary", "experience", "projects", "skills", "education", "certifications", "languages", "sections"]),
        new(Ats, "ATS-Friendly", "متوافق مع أنظمة ATS",
            "Plain single column, standard headings, black text and no graphics — what applicant tracking systems read best.",
            "عمود واحد بسيط وعناوين قياسية ونص أسود بلا رسومات — أسهل ما تقرؤه أنظمة تتبع المتقدمين.",
            "#111111", "sans", false, false, true, ["summary", "skills", "experience", "projects", "education", "certifications", "languages", "sections"]),
        new(Minimal, "Minimalist", "بسيط",
            "Centred name, generous white space and quiet headings that keep the focus on experience and skills.",
            "اسم في المنتصف ومساحات بيضاء واسعة وعناوين هادئة تُبقي التركيز على الخبرة والمهارات.",
            "#374151", "lato", true, false, false, ["summary", "experience", "skills", "projects", "education", "certifications", "languages", "sections"]),
        new(Technical, "Technical Developer", "مطوّر تقني",
            "Two columns: a sidebar for contact details, grouped technical skills and links, and a main column led by projects.",
            "عمودان: شريط جانبي لبيانات التواصل والمهارات التقنية المصنفة والروابط، وعمود رئيسي تتصدّره المشاريع.",
            "#0f766e", "sans", true, false, false, ["summary", "projects", "experience", "education", "certifications", "skills", "languages", "sections"]),
        new(Executive, "Executive / Corporate", "تنفيذي / مؤسسي",
            "Serif typography, a formal header and an emphasis on experience and achievements.",
            "خط رسمي (Serif) ورأس رسمي وتركيز على الخبرة والإنجازات.",
            "#1e3a5f", "serif", true, true, false, ["summary", "experience", "projects", "education", "skills", "certifications", "languages", "sections"]),
        new(Creative, "Creative Modern", "إبداعي حديث",
            "A full-height coloured sidebar with photo, skills and languages beside a bold main column — distinctive but professional.",
            "شريط جانبي ملوّن بطول الصفحة مع الصورة والمهارات واللغات بجوار عمود رئيسي جريء — مميز لكن احترافي.",
            "#7c3aed", "lato", true, true, false, ["summary", "experience", "projects", "education", "certifications", "skills", "languages", "sections"]),
    ];

    public static CvTemplateDto Get(string? key) =>
        All.FirstOrDefault(t => t.Key == key) ?? throw new ApiProblemException(400, "unknown_template", "Choose one of the available templates.");

    public static readonly string[] SectionKeys = ["summary", "experience", "projects", "skills", "education", "certifications", "languages", "sections"];
    public static readonly string[] Fonts = ["sans", "serif", "lato"];
}

/// <summary>Validation, normalisation and (de)serialisation of CV content and style.</summary>
public static partial class CvRules
{
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public const int MaxJsonChars = 200_000;

    [GeneratedRegex("^#[0-9a-fA-F]{6}$")] private static partial Regex ColorPattern();
    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")] private static partial Regex EmailPattern();

    public static CvContent Empty(string fullName = "", string email = "", string title = "") =>
        Normalize(new CvContent(Personal: new CvPersonal(FullName: fullName, Email: email, Title: title)));

    public static CvStyle DefaultStyle(CvTemplateDto template) =>
        new(template.DefaultAccent, template.DefaultFont, [.. template.DefaultOrder], [], "comfortable", "ltr", template.SupportsPhoto);

    public static CvContent ParseContent(string json) =>
        Normalize(JsonSerializer.Deserialize<CvContent>(json, Json) ?? new CvContent());

    public static CvStyle ParseStyle(string json, CvTemplateDto template)
    {
        var style = JsonSerializer.Deserialize<CvStyle>(json, Json);
        return style is null ? DefaultStyle(template) : NormalizeStyle(style, template);
    }

    /// <summary>Trims text, drops empty entries and enforces the size limits, so every renderer gets clean data.</summary>
    public static CvContent Normalize(CvContent c)
    {
        static string T(string? s, int max) => (s ?? "").Trim() is var t && t.Length > max ? t[..max] : (s ?? "").Trim();
        static List<string> L(List<string>? items, int maxItems, int maxLength) =>
            (items ?? []).Select(i => T(i, maxLength)).Where(i => i.Length > 0).Take(maxItems).ToList();

        var p = c.Personal ?? new CvPersonal();
        return new CvContent(
            new CvPersonal(T(p.FullName, 100), T(p.Title, 120), T(p.Email, 254), T(p.Phone, 40), T(p.Location, 120),
                T(p.LinkedIn, 300), T(p.GitHub, 300), T(p.Website, 300)),
            T(c.Summary, 2000),
            (c.Education ?? []).Take(10).Select(e => new CvEducation(T(e.Institution, 150), T(e.Degree, 150), T(e.Field, 150),
                T(e.Start, 20), T(e.End, 20), T(e.Description, 800), L(e.Achievements, 10, 300))).ToList(),
            (c.Experience ?? []).Take(15).Select(e => new CvExperience(T(e.Title, 120), T(e.Company, 150), T(e.EmploymentType, 40),
                T(e.Location, 120), T(e.Start, 20), T(e.End, 20), e.Current, L(e.Responsibilities, 12, 400), L(e.Achievements, 12, 400))).ToList(),
            (c.Skills ?? []).Take(12).Select(g => new CvSkillGroup(T(g.Category, 60), L(g.Items, 40, 60))).ToList(),
            (c.Projects ?? []).Take(15).Select(p => new CvProject(T(p.Name, 150), T(p.Description, 1200), L(p.Technologies, 20, 60),
                L(p.Highlights, 10, 400), T(p.RepoUrl, 300), T(p.DemoUrl, 300), T(p.Date, 20))).ToList(),
            (c.Certifications ?? []).Take(20).Select(x => new CvCertification(T(x.Name, 150), T(x.Issuer, 150), T(x.Date, 20),
                T(x.Url, 300), T(x.Description, 500))).ToList(),
            (c.Languages ?? []).Take(15).Select(l => new CvLanguage(T(l.Name, 60), T(l.Level, 60))).ToList(),
            (c.Sections ?? []).Take(10).Select(s => new CvSection(T(s.Kind, 30), T(s.Title, 80), L(s.Items, 30, 400))).ToList());
    }

    public static CvStyle NormalizeStyle(CvStyle s, CvTemplateDto template)
    {
        var order = (s.SectionOrder ?? []).Where(k => CvTemplates.SectionKeys.Contains(k)).Distinct().ToList();
        order.AddRange(template.DefaultOrder.Where(k => !order.Contains(k)));
        return new CvStyle(
            template.SupportsColor && s.Accent is not null && ColorPattern().IsMatch(s.Accent) ? s.Accent : template.DefaultAccent,
            CvTemplates.Fonts.Contains(s.Font) ? s.Font : template.DefaultFont,
            order,
            (s.Hidden ?? []).Where(k => CvTemplates.SectionKeys.Contains(k)).Distinct().ToList(),
            s.Density == "compact" ? "compact" : "comfortable",
            s.Direction == "rtl" ? "rtl" : "ltr",
            template.SupportsPhoto && s.ShowPhoto);
    }

    /// <summary>Rejects what normalising can't fix: malformed e-mail, links that aren't http(s).</summary>
    public static void Validate(CvContent c)
    {
        var p = c.Personal!;
        if (p.Email.Length > 0 && !EmailPattern().IsMatch(p.Email))
            throw new RequestValidationException("personal.email", "invalid_email", "Enter a valid e-mail address.");
        static void Url(string key, string value)
        {
            if (value.Length > 0 && !IsWebUrl(value))
                throw new RequestValidationException(key, "invalid_url", "Links must start with http:// or https://.");
        }
        Url("personal.linkedIn", p.LinkedIn);
        Url("personal.gitHub", p.GitHub);
        Url("personal.website", p.Website);
        for (var i = 0; i < c.Projects!.Count; i++)
        {
            Url($"projects[{i}].repoUrl", c.Projects[i].RepoUrl);
            Url($"projects[{i}].demoUrl", c.Projects[i].DemoUrl);
        }
        for (var i = 0; i < c.Certifications!.Count; i++) Url($"certifications[{i}].url", c.Certifications[i].Url);
    }

    public static bool IsWebUrl(string value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp);

    public static string Serialize<T>(T value)
    {
        var json = JsonSerializer.Serialize(value, Json);
        if (json.Length > MaxJsonChars) throw new ApiProblemException(413, "cv_too_large", "This CV is too large. Shorten some sections.");
        return json;
    }
}
