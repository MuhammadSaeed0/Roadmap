using System.Text.RegularExpressions;
using DevPath.Api.DTOs;

namespace DevPath.Api.Services.Cv;

/// <summary>
/// Rule-based checks that need no AI: an ATS-readiness review of a CV and keyword matching against a job
/// description. The score is a guide to common problems, not a prediction of how any real system will rank a CV.
/// </summary>
public partial class CvAnalysisService(CvPdfRenderer pdf, CvSuggestionService suggestions)
{
    /// <summary>Technical and professional keywords recognised in job descriptions, with the spellings that count as each.</summary>
    private static readonly (string Name, string[] Patterns)[] Keywords =
    [
        ("C#", [@"C#", @"C sharp"]), (".NET", [@"\.NET(?! Core)", @"dotnet"]), ("ASP.NET Core", [@"ASP\.NET( Core)?", @"\.NET Core"]),
        ("Entity Framework Core", [@"Entity Framework( Core)?", @"EF ?Core", @"\bEF\b"]), ("LINQ", [@"LINQ"]),
        ("SQL Server", [@"SQL Server", @"MS ?SQL", @"MSSQL"]), ("T-SQL", [@"T-?SQL"]), ("SQL", [@"SQL"]),
        ("PostgreSQL", [@"Postgre(SQL|s)"]), ("MySQL", [@"MySQL"]), ("MongoDB", [@"Mongo(DB)?"]), ("Redis", [@"Redis"]),
        ("REST APIs", [@"REST(ful)?( APIs?)?", @"Web ?API"]), ("GraphQL", [@"GraphQL"]), ("gRPC", [@"gRPC"]), ("SignalR", [@"SignalR"]),
        ("Angular", [@"Angular"]), ("TypeScript", [@"TypeScript"]), ("JavaScript", [@"JavaScript", @"\bJS\b", @"ES6"]),
        ("RxJS", [@"RxJS"]), ("NgRx", [@"NgRx"]), ("HTML", [@"HTML5?"]), ("CSS", [@"CSS3?", @"SCSS", @"Sass"]),
        ("React", [@"React(\.js)?"]), ("Vue", [@"Vue(\.js)?"]), ("Blazor", [@"Blazor"]), ("Node.js", [@"Node(\.js|JS)"]),
        ("Python", [@"Python"]), ("Java", [@"Java(?!Script)"]),
        ("Git", [@"Git(?!Hub|Lab)"]), ("GitHub", [@"GitHub"]), ("Azure", [@"Azure"]), ("AWS", [@"AWS", @"Amazon Web Services"]),
        ("Docker", [@"Docker"]), ("Kubernetes", [@"Kubernetes", @"K8s"]), ("CI/CD", [@"CI ?/ ?CD", @"continuous (integration|delivery|deployment)", @"GitHub Actions", @"Azure DevOps"]),
        ("Unit testing", [@"unit test(s|ing)?", @"automated test(s|ing)?", @"TDD"]), ("xUnit", [@"xUnit"]), ("NUnit", [@"NUnit"]),
        ("Jest", [@"Jest"]), ("Vitest", [@"Vitest"]),
        ("Microservices", [@"micro-?services?"]), ("RabbitMQ", [@"RabbitMQ"]), ("Message queues", [@"message (queue|broker)s?", @"Kafka", @"Service Bus"]),
        ("OOP", [@"OOP", @"object[- ]oriented"]), ("SOLID", [@"SOLID"]), ("Design patterns", [@"design patterns?"]),
        ("Clean Architecture", [@"clean architecture"]), ("DDD", [@"DDD", @"domain[- ]driven"]), ("CQRS", [@"CQRS"]), ("MediatR", [@"MediatR"]),
        ("Dapper", [@"Dapper"]), ("JWT", [@"JWT", @"JSON Web Tokens?"]), ("OAuth", [@"OAuth", @"OpenID"]),
        ("Authentication", [@"authentication", @"authorization"]), ("MVC", [@"\bMVC\b"]), ("Razor", [@"Razor"]),
        ("Swagger / OpenAPI", [@"Swagger", @"OpenAPI"]), ("Linux", [@"Linux"]), ("Agile", [@"Agile", @"Scrum", @"Kanban"]),
        ("Performance optimisation", [@"performance (tuning|optimi[sz]ation)", @"query optimi[sz]ation"]),
        ("Debugging", [@"debugging"]), ("Code review", [@"code reviews?"]), ("Problem solving", [@"problem[- ]solving"]),
        ("Communication", [@"communication skills?"]), ("Teamwork", [@"team ?work", @"team player", @"collaborat(e|ion)"]),
        ("English", [@"English"]),
    ];

    private static readonly Dictionary<string, Regex> KeywordRegex = Keywords.ToDictionary(k => k.Name,
        k => new Regex(@"(?<![A-Za-z0-9#])(" + string.Join("|", k.Patterns) + @")(?![A-Za-z0-9#+])", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant));

    /// <summary>Skill names used by the platform's suggestions that correspond to a keyword.</summary>
    private static readonly Dictionary<string, string> KeywordToSkill = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Unit testing"] = "Automated testing", ["xUnit"] = "Automated testing", [".NET"] = "C#", ["LINQ"] = "C#", ["T-SQL"] = "SQL Server",
        ["REST APIs"] = "ASP.NET Core", ["RxJS"] = "Angular",
    };

    [GeneratedRegex(@"\d")] private static partial Regex Digit();

    // ---------------------------------------------------------------- ATS readiness

    public CvAtsReportDto Check(CvTemplateDto template, CvContent c, CvStyle s, string? jobDescription)
    {
        var issues = new List<CvAtsIssue>();
        void Add(string severity, string section, string code, string en, string ar) => issues.Add(new(severity, section, code, en, ar));
        var p = c.Personal!;
        bool Shown(string key) => !s.Hidden!.Contains(key);

        if (p.FullName.Length == 0) Add("error", "personal", "no_name", "Add your full name.", "أضف اسمك الكامل.");
        if (p.Email.Length == 0) Add("error", "personal", "no_email", "Add an e-mail address so employers can reach you.", "أضف بريدًا إلكترونيًا ليتمكن أصحاب العمل من التواصل معك.");
        if (p.Phone.Length == 0) Add("warning", "personal", "no_phone", "Add a phone number.", "أضف رقم هاتف.");
        if (p.Location.Length == 0) Add("info", "personal", "no_location", "Add your city and country; many recruiters filter by location.", "أضف مدينتك ودولتك؛ كثير من مسؤولي التوظيف يصفّون حسب الموقع.");
        if (p.Title.Length == 0) Add("warning", "personal", "no_title", "Add a professional title that matches the jobs you apply for.", "أضف مسمى وظيفيًا يطابق الوظائف التي تتقدم لها.");

        if (c.Summary.Length == 0 || !Shown("summary"))
            Add("warning", "summary", "no_summary", "Add a short professional summary (2–4 sentences).", "أضف ملخصًا مهنيًا قصيرًا (من جملتين إلى أربع).");
        else if (c.Summary.Length > 700)
            Add("info", "summary", "long_summary", "Shorten the summary to about 2–4 sentences.", "اختصر الملخص إلى نحو جملتين إلى أربع.");

        var skillCount = c.Skills!.Sum(g => g.Items!.Count);
        if (skillCount == 0 || !Shown("skills"))
            Add("error", "skills", "no_skills", "Add a skills section; ATS search for skill keywords first.", "أضف قسم المهارات؛ أنظمة ATS تبحث عن كلمات المهارات أولًا.");
        else if (skillCount < 5)
            Add("info", "skills", "few_skills", "List the main technologies you can actually use (usually 8–15).", "اذكر التقنيات الأساسية التي تجيد استخدامها فعلًا (عادة من 8 إلى 15).");

        if (c.Experience!.Count == 0 && c.Projects!.Count == 0)
            Add("error", "experience", "no_experience_or_projects", "Add work experience or projects that show what you have built.", "أضف خبرة عملية أو مشاريع توضح ما بنيته.");
        else if (c.Experience!.Count == 0)
            Add("info", "experience", "projects_only", "No work experience yet is fine: put projects before education and describe what you built.", "عدم وجود خبرة عملية أمر طبيعي: ضع المشاريع قبل التعليم واشرح ما بنيته.");

        for (var i = 0; i < c.Experience!.Count; i++)
        {
            var x = c.Experience[i];
            var name = x.Title.Length > 0 ? x.Title : x.Company;
            if (x.Start.Length == 0 || (x.End.Length == 0 && !x.Current))
                Add("warning", "experience", "missing_dates", $"Add start and end dates to “{name}”.", $"أضف تاريخي البداية والنهاية إلى «{name}».");
            if (x.Responsibilities!.Count + x.Achievements!.Count == 0)
                Add("warning", "experience", "no_bullets", $"Describe what you did in “{name}” in 2–5 bullet points.", $"صف ما قمت به في «{name}» في نقاط من 2 إلى 5.");
        }
        var bullets = c.Experience!.SelectMany(x => x.Responsibilities!.Concat(x.Achievements!)).Concat(c.Projects!.SelectMany(x => x.Highlights!)).ToList();
        if (bullets.Any(b => b.Length > 250))
            Add("info", "experience", "long_bullets", "Keep each bullet to one or two lines.", "اجعل كل نقطة في سطر أو سطرين.");
        if (bullets.Count >= 3 && !bullets.Any(b => Digit().IsMatch(b)))
            Add("info", "experience", "no_numbers", "Where you have real figures (users, time saved, records, tests), include them.", "إذا كانت لديك أرقام حقيقية (مستخدمون، وقت موفَّر، سجلات، اختبارات) فاذكرها.");

        foreach (var x in c.Projects!)
            if (x.Description.Length == 0 && x.Highlights!.Count == 0)
                Add("warning", "projects", "project_no_description", $"Describe what “{x.Name}” does and your part in it.", $"صف ما يفعله «{x.Name}» ودورك فيه.");
        if (c.Projects!.Count > 0 && c.Projects.All(x => x.RepoUrl.Length == 0 && x.DemoUrl.Length == 0) && p.GitHub.Length == 0)
            Add("info", "projects", "no_links", "Link at least one repository or your GitHub profile.", "أضف رابط مستودع واحد على الأقل أو حسابك على GitHub.");

        if (c.Education!.Count == 0 || !Shown("education"))
            Add("warning", "education", "no_education", "Add your education (or relevant training).", "أضف تعليمك (أو تدريبًا ذا صلة).");

        if (template.Key is CvTemplates.Technical or CvTemplates.Creative)
            Add("warning", "design", "two_columns", "Two-column layouts can be read out of order by some ATS. Use the ATS-Friendly template for online applications.",
                "قد تقرأ بعض أنظمة ATS التصاميم ذات العمودين بترتيب خاطئ. استخدم قالب «متوافق مع ATS» عند التقديم عبر الإنترنت.");
        if (s.ShowPhoto)
            Add("info", "design", "photo", "Many employers (and ATS) prefer CVs without a photo; check what is usual where you apply.",
                "يفضّل كثير من أصحاب العمل (وأنظمة ATS) السيرة دون صورة؛ تحقق من المعتاد حيث تتقدم.");
        var pages = pdf.Preview(template, c, s, null, 12).Count;
        if (pages > 2)
            Add("warning", "design", "too_long", $"The CV is {pages} pages. Aim for one page (two at most).", $"السيرة {pages} صفحات. اجعلها صفحة واحدة (صفحتين كحد أقصى).");
        else if (pages == 2 && c.Experience!.Count < 2)
            Add("info", "design", "two_pages", "At this stage one page is usually enough; try the compact density.", "في هذه المرحلة تكفي عادة صفحة واحدة؛ جرّب الكثافة المضغوطة.");

        var dates = c.Experience!.SelectMany(x => new[] { x.Start, x.End }).Concat(c.Education!.SelectMany(x => new[] { x.Start, x.End }))
            .Where(d => d.Length > 0).Select(DateShape).Distinct().Count();
        if (dates > 1) Add("info", "design", "date_formats", "Use one date format everywhere (for example “Jul 2023”).", "استخدم صيغة تاريخ واحدة في كل مكان (مثل «Jul 2023»).");

        var score = 100 - issues.Sum(i => i.Severity switch { "error" => 15, "warning" => 7, _ => 2 });
        IReadOnlyList<string> matched = [], missing = [];
        if (!string.IsNullOrWhiteSpace(jobDescription))
        {
            var wanted = Find(jobDescription);
            var text = CvText(c);
            matched = wanted.Where(k => KeywordRegex[k].IsMatch(text)).ToList();
            missing = wanted.Except(matched).ToList();
            if (wanted.Count > 0) score = (int)Math.Round(score * 0.7 + 100.0 * matched.Count / wanted.Count * 0.3);
        }
        var order = new[] { "error", "warning", "info" };
        return new CvAtsReportDto(Math.Clamp(score, 0, 100), issues.OrderBy(i => Array.IndexOf(order, i.Severity)).ToList(), matched, missing);
    }

    // ---------------------------------------------------------------- job description matching

    public async Task<CvJobMatchDto> MatchAsync(CvContent c, CvStyle s, string jobDescription, CancellationToken ct)
    {
        var wanted = Find(jobDescription);
        var text = CvText(c);
        var matched = wanted.Where(k => KeywordRegex[k].IsMatch(text)).ToList();
        var notInCv = wanted.Except(matched).ToList();

        var platform = (await suggestions.GetAsync(false, ct)).Skills.Select(x => x.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var learning = notInCv.Where(k => platform.Contains(k) || (KeywordToSkill.TryGetValue(k, out var skill) && platform.Contains(skill))).ToList();
        var missing = notInCv.Except(learning).ToList();

        var projects = c.Projects!
            .Select(p => (p.Name, Hits: wanted.Count(k => KeywordRegex[k].IsMatch(string.Join(" ", [p.Name, p.Description, .. p.Technologies!, .. p.Highlights!])))))
            .Where(p => p.Hits > 0).OrderByDescending(p => p.Hits).Take(3).Select(p => p.Name).ToList();

        // Lead with what best matches the job: skills right after the summary, and projects before experience
        // when the projects show more of the wanted keywords than the work history does.
        var experienceHits = wanted.Count(k => KeywordRegex[k].IsMatch(string.Join(" ", c.Experience!.SelectMany(x => x.Responsibilities!.Concat(x.Achievements!).Append(x.Title)))));
        var projectHits = wanted.Count(k => KeywordRegex[k].IsMatch(string.Join(" ", c.Projects!.SelectMany(x => x.Technologies!.Concat(x.Highlights!).Append(x.Name).Append(x.Description)))));
        var order = new List<string> { "summary", "skills" };
        order.AddRange(projectHits > experienceHits || c.Experience!.Count == 0 ? ["projects", "experience"] : ["experience", "projects"]);
        order.AddRange(s.SectionOrder!.Where(k => !order.Contains(k)));

        return new CvJobMatchDto(wanted, matched, learning, missing, projects, order);
    }

    // ---------------------------------------------------------------- helpers

    public static IReadOnlyList<string> Find(string text) =>
        Keywords.Where(k => KeywordRegex[k.Name].IsMatch(text)).Select(k => k.Name)
            // "SQL" alone adds nothing when a more specific SQL keyword was found.
            .Where((k, _) => k != "SQL" || !Keywords.Any(o => o.Name is "SQL Server" or "T-SQL" or "PostgreSQL" or "MySQL" && KeywordRegex[o.Name].IsMatch(text)))
            .ToList();

    public static string CvText(CvContent c) => string.Join("\n", new[]
    {
        c.Personal!.Title, c.Summary,
    }
    .Concat(c.Skills!.SelectMany(g => g.Items!))
    .Concat(c.Experience!.SelectMany(x => new[] { x.Title, x.Company }.Concat(x.Responsibilities!).Concat(x.Achievements!)))
    .Concat(c.Projects!.SelectMany(x => new[] { x.Name, x.Description }.Concat(x.Technologies!).Concat(x.Highlights!)))
    .Concat(c.Education!.SelectMany(x => new[] { x.Degree, x.Field, x.Description }.Concat(x.Achievements!)))
    .Concat(c.Certifications!.SelectMany(x => new[] { x.Name, x.Description }))
    .Concat(c.Languages!.Select(x => x.Name))
    .Concat(c.Sections!.SelectMany(x => x.Items!)));

    /// <summary>"Jul 2023" and "September 2023" → "a 9", "07/2023" → "9/9": dates with the same shape share a format.</summary>
    private static string DateShape(string date) => Digits().Replace(Letters().Replace(date.Trim(), "a"), "9");

    [GeneratedRegex(@"\p{L}+")] private static partial Regex Letters();
    [GeneratedRegex(@"\d+")] private static partial Regex Digits();
}
