using DevPath.Api.DTOs;

namespace DevPath.Api.Services.Cv;

/// <summary>A fictional CV used to show what each template looks like.</summary>
public static class CvSamples
{
    public static readonly CvContent Content = CvRules.Normalize(new CvContent(
        new CvPersonal("Sara Ahmed", "Junior Full-Stack .NET Developer", "sara@example.com", "+20 100 000 0000", "Cairo, Egypt",
            "https://linkedin.com/in/sara-example", "https://github.com/sara-example", ""),
        "Junior full-stack developer who builds web applications with ASP.NET Core, Entity Framework Core, SQL Server and Angular. " +
        "Completed a structured full-stack roadmap with hands-on projects and automatically checked coding exercises.",
        [new("Cairo University", "B.Sc.", "Computer Science", "2020", "2024", "", ["Graduation project: inventory system"])],
        [new("Software Development Intern", "Example Tech", "Internship", "Cairo", "Jul 2023", "Sep 2023", false,
            ["Built REST endpoints with ASP.NET Core for an internal tool", "Wrote unit tests with xUnit for the order service"],
            ["Fixed a slow query by adding an index"])],
        [new("Languages", ["C#", "TypeScript", "SQL"]), new("Frameworks", ["ASP.NET Core", "Entity Framework Core", "Angular"]),
            new("Tools", ["Git", "Visual Studio", "Postman"])],
        [new("Employee Management System", "Full-stack app to manage employees and departments with search and paging.",
            ["Angular", "ASP.NET Core", "SQL Server"], ["Reactive forms with server-side validation", "Paged, filtered API with EF Core"],
            "https://github.com/sara-example/employees", "", "2024"),
         new("Task Tracker API", "REST API for personal tasks with authentication and tests.", ["ASP.NET Core", "EF Core", "xUnit"],
            ["JWT sign-in and per-user data", "Integration tests for every endpoint"], "https://github.com/sara-example/tasks", "", "2024")],
        [],
        [new("Arabic", "Native"), new("English", "Professional working")],
        []));
}
