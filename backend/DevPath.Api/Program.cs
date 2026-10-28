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
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

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
    o.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    o.ExpireTimeSpan = TimeSpan.FromDays(14);
    o.SlidingExpiration = true;
    o.Events.OnRedirectToLogin = ctx => WriteAuthProblem(ctx, StatusCodes.Status401Unauthorized, "unauthenticated", "Sign in to continue.");
    o.Events.OnRedirectToAccessDenied = ctx => WriteAuthProblem(ctx, StatusCodes.Status403Forbidden, "forbidden", "You are not allowed to do that.");
});
// Every endpoint needs a signed-in account unless it says [AllowAnonymous].
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());
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

// The Angular dev server runs on another port, so the browser needs CORS permission.
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
    app.UseHttpsRedirection();

app.UseCors(FrontendCors);
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
