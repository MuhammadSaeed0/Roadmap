using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using DevPath.Api.Controllers;
using DevPath.Api.Data;
using DevPath.Api.Data.Seeding;
using DevPath.Api.Middleware;
using DevPath.Api.Models;
using DevPath.Api.Services;
using DevPath.Api.Validation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(o => o.AddServerHeader = false);   // don't advertise the server software

// `dotnet DevPath.Api.dll --check-config` (used by deploy/publish.ps1) lists missing production settings and exits.
if (args.Contains("--check-config"))
{
    var missing = ProductionSettings.Problems(builder.Configuration);
    Console.WriteLine(missing.Count == 0 ? "Production configuration looks complete." : "Production configuration is incomplete:");
    foreach (var problem in missing) Console.WriteLine("- " + problem);
    Environment.Exit(missing.Count == 0 ? 0 : 1);
}

// A live deployment refuses to start with development settings (LocalDB, console-only email, localhost links).
if (builder.Environment.IsProduction() && ProductionSettings.Problems(builder.Configuration) is { Count: > 0 } problems)
    throw new InvalidOperationException("Production configuration is incomplete:" + Environment.NewLine + "- " +
        string.Join(Environment.NewLine + "- ", problems) + Environment.NewLine + "See docs/DEPLOYMENT.md.");

// ---------- Database ----------
// The connection string lives in appsettings.json (LocalDB, Windows authentication, no password).
// To use a different server or credentials, override it with user secrets — see README.
var connectionString = builder.Configuration.GetConnectionString("DevPath")
    ?? throw new InvalidOperationException("Connection string 'DevPath' is missing from configuration.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure(3));
    if (builder.Environment.IsDevelopment())
        options.EnableDetailedErrors();
});

// ---------- Accounts ----------
// ASP.NET Core Identity stores accounts in the same database (AspNetUsers…) with salted
// PBKDF2 password hashes. Signing in issues an HttpOnly cookie; the API answers 401/403 as
// ProblemDetails instead of redirecting, because the client is the Angular app.
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();
builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme).AddIdentityCookies();
builder.Services.AddIdentityCore<AppUser>(o =>
    {
        o.User.RequireUniqueEmail = true;
        o.Password.RequiredLength = 8;
        o.Password.RequireDigit = true;
        o.Password.RequireLowercase = false;
        o.Password.RequireUppercase = false;
        o.Password.RequireNonAlphanumeric = false;
        o.Lockout.MaxFailedAccessAttempts = 5;
        o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
        o.Lockout.AllowedForNewUsers = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders()
    .AddPasswordValidator<LetterPasswordValidator>();
builder.Services.Configure<DataProtectionTokenProviderOptions>(o => o.TokenLifespan = TimeSpan.FromHours(1));
// After a password change or reset, other devices are signed out within this interval.
builder.Services.Configure<SecurityStampValidatorOptions>(o => o.ValidationInterval = TimeSpan.FromMinutes(5));
builder.Services.ConfigureApplicationCookie(o =>
{
    o.Cookie.Name = "devpath.auth";
    o.Cookie.HttpOnly = true;
    // localhost:4200 and localhost:5080 are the same site, so Strict still works and blocks cross-site requests (CSRF).
    o.Cookie.SameSite = SameSiteMode.Strict;
    // The live site is HTTPS only, so the cookie is never sent over plain HTTP there.
    o.Cookie.SecurePolicy = builder.Environment.IsProduction() ? CookieSecurePolicy.Always : CookieSecurePolicy.SameAsRequest;
    o.ExpireTimeSpan = TimeSpan.FromDays(14);
    o.SlidingExpiration = true;
    o.Events.OnRedirectToLogin = ctx => WriteAuthProblem(ctx, StatusCodes.Status401Unauthorized, "unauthenticated", "Sign in to continue.");
    o.Events.OnRedirectToAccessDenied = ctx => WriteAuthProblem(ctx, StatusCodes.Status403Forbidden, "forbidden", "You are not allowed to do that.");
});
// Every endpoint needs a signed-in, verified and approved account unless it says otherwise.
// The account's status and roles are read from the database on each request, so approving,
// suspending or demoting someone takes effect immediately.
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser()
        .AddRequirements(new ActiveSessionRequirement(), new ApprovedAccountRequirement()).Build())
    .AddPolicy(Policies.SignedIn, p => p.RequireAuthenticatedUser().AddRequirements(new ActiveSessionRequirement()))
    .AddPolicy(Policies.Admin, p => p.RequireAuthenticatedUser().AddRequirements(new ActiveSessionRequirement(), new AdminRequirement()));
builder.Services.AddScoped<IAuthorizationHandler, AccountRequirementsHandler>();
builder.Services.AddSingleton<IAuthorizationMiddlewareResultHandler, ProblemAuthorizationResultHandler>();
builder.Services.AddScoped<AccountAccess>();
builder.Services.AddScoped<AccountTokenService>();
builder.Services.AddScoped<AccountEmails>();
builder.Services.AddScoped<AccountWorkflow>();
builder.Services.AddScoped<AdminService>();

// Keys that protect the auth cookie live in the database, so sign-ins survive app restarts and
// redeploys on hosts where the app can't keep files between deployments.
builder.Services.AddDataProtection().PersistKeysToDbContext<AppDbContext>().SetApplicationName("DevPath");

// Email: "Log" writes messages to the console (development); "Brevo" delivers them. The API key is a secret
// (environment variable Email__Brevo__ApiKey) — see docs/EMAIL.md.
builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection(EmailOptions.SectionName));
if (string.Equals(builder.Configuration["Email:Provider"], "Brevo", StringComparison.OrdinalIgnoreCase))
    builder.Services.AddHttpClient<IAccountEmailSender, BrevoEmailSender>(client => client.Timeout = TimeSpan.FromSeconds(15));
else
    builder.Services.AddScoped<IAccountEmailSender, LoggingAccountEmailSender>();

// Slows down password guessing and sign-up spam: N attempts per minute per client address.
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.OnRejected = async (ctx, ct) =>
    {
        var problem = new ProblemDetails { Status = 429, Title = "Too many attempts. Wait a minute and try again." };
        problem.Extensions["code"] = "rate_limited";
        await ctx.HttpContext.Response.WriteAsJsonAsync(problem, (System.Text.Json.JsonSerializerOptions?)null, "application/problem+json", ct);
    };
    o.AddPolicy(AuthRateLimit.Policy, http => RateLimitPartition.GetFixedWindowLimiter(
        http.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = builder.Configuration.GetValue("Auth:AttemptsPerMinute", 10),
            Window = TimeSpan.FromMinutes(1),
        }));
});

// ---------- API ----------
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()))
    .AddConsistentValidationResponses();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddOpenApi();

// The Angular dev server runs on another port, so the browser needs CORS permission. In production the
// API serves the app itself (same origin), so CORS isn't enabled there at all.
const string FrontendCors = "frontend";
builder.Services.AddCors(options => options.AddPolicy(FrontendCors, policy =>
    policy.WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:4200"])
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials()));   // the auth cookie travels with cross-origin requests from the Angular dev server

builder.Services.AddHttpClient(ResourceService.HttpClientName, client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("DevPath-LinkChecker/1.0 (+local learning app)");
});

// YouTube: the API key comes from user secrets or an environment variable (YouTube__ApiKey), never the frontend.
builder.Services.Configure<YouTubeOptions>(builder.Configuration.GetSection(YouTubeOptions.SectionName));
builder.Services.AddHttpClient<IYouTubeClient, YouTubeClient>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(10);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("DevPath/1.0 (+local learning app)");
});

// ---------- Application services ----------
builder.Services.Configure<ProgressOptions>(builder.Configuration.GetSection(ProgressOptions.SectionName));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<DbSeeder>();
builder.Services.AddScoped<LearningStateLoader>();
builder.Services.AddScoped<TopicService>();
builder.Services.AddScoped<ProjectService>();
builder.Services.AddScoped<StudySessionService>();
builder.Services.AddScoped<ResourceService>();
builder.Services.AddScoped<PracticeService>();
builder.Services.AddScoped<InterviewService>();
builder.Services.AddScoped<NoteService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<PreferenceService>();
builder.Services.AddScoped<RecommendationService>();
builder.Services.AddScoped<StudyPlanService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<AnalyticsService>();
builder.Services.AddScoped<CareerReadinessService>();
builder.Services.AddScoped<SearchService>();
builder.Services.AddScoped<TopicVideoService>();
builder.Services.AddScoped<QuizService>();

var app = builder.Build();

// ---------- HTTP pipeline (order matters) ----------
app.UseMiddleware<RequestTimingMiddleware>();   // outermost, so it logs the final status code
app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
    app.MapOpenApi().AllowAnonymous(); // http://localhost:5080/openapi/v1.json
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseMiddleware<SecurityHeadersMiddleware>();
// In production the built Angular app is served from wwwroot by this same site (see docs/DEPLOYMENT.md).
var hasFrontend = app.Environment.WebRootFileProvider.GetFileInfo("index.html").Exists;
if (hasFrontend) app.UseStaticFiles();

if (app.Environment.IsDevelopment()) app.UseCors(FrontendCors);
app.UseMiddleware<OriginCheckMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();

// Lightweight health check the Angular app uses to show an "API offline" banner.
app.MapGet("/api/health", async (AppDbContext db, CancellationToken ct) =>
    await db.Database.CanConnectAsync(ct)
        ? Results.Ok(new { status = "ok", database = "connected" })
        : Results.Json(new { status = "degraded", database = "unreachable" }, statusCode: 503))
    .AllowAnonymous();

if (hasFrontend)
{
    // Unknown /api paths stay JSON 404s; every other path is an Angular route, so it gets index.html.
    app.MapFallback("api/{**rest}", () => Results.Problem(statusCode: StatusCodes.Status404NotFound, title: "Not found.")).AllowAnonymous();
    app.MapFallbackToFile("index.html").AllowAnonymous();
}

if (!app.Configuration.GetValue("Database:SkipInitialization", false))
    await app.InitializeDatabaseAsync();

app.Run();

static Task WriteAuthProblem(RedirectContext<CookieAuthenticationOptions> ctx, int status, string code, string title)
{
    ctx.Response.StatusCode = status;
    var problem = new ProblemDetails { Status = status, Title = title };
    problem.Extensions["code"] = code;
    return ctx.Response.WriteAsJsonAsync(problem, (System.Text.Json.JsonSerializerOptions?)null, "application/problem+json");
}

// Exposes the auto-generated Program class to WebApplicationFactory in the test project.
public partial class Program;
