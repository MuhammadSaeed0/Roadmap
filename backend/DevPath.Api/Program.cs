using System.Text.Json.Serialization;
using DevPath.Api.Data;
using DevPath.Api.Data.Seeding;
using DevPath.Api.Middleware;
using DevPath.Api.Services;
using DevPath.Api.Validation;
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
          .AllowAnyMethod()));

builder.Services.AddHttpClient(ResourceService.HttpClientName, client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("DevPath-LinkChecker/1.0 (+local learning app)");
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

var app = builder.Build();

// ---------- HTTP pipeline (order matters) ----------
app.UseMiddleware<RequestTimingMiddleware>();   // outermost, so it logs the final status code
app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
    app.MapOpenApi(); // http://localhost:5080/openapi/v1.json
else
    app.UseHttpsRedirection();

app.UseCors(FrontendCors);
app.MapControllers();

// Lightweight health check the Angular app uses to show an "API offline" banner.
app.MapGet("/api/health", async (AppDbContext db, CancellationToken ct) =>
    await db.Database.CanConnectAsync(ct)
        ? Results.Ok(new { status = "ok", database = "connected" })
        : Results.Json(new { status = "degraded", database = "unreachable" }, statusCode: 503));

if (!app.Configuration.GetValue("Database:SkipInitialization", false))
    await app.InitializeDatabaseAsync();

app.Run();

// Exposes the auto-generated Program class to WebApplicationFactory in the test project.
public partial class Program;
