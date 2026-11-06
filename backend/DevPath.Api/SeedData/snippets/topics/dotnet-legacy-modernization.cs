// New ASP.NET Core app in front of the legacy site (strangler fig with YARP).
// Routes that are already migrated are handled here; everything else is proxied.
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));
builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();            // e.g. /api/claims, migrated with tests
app.MapReverseProxy();           // fallback: forwards to the old MVC 5 app on IIS
app.Run();

// appsettings.json
// "ReverseProxy": {
//   "Routes":   { "legacy": { "ClusterId": "legacy", "Order": 1000, "Match": { "Path": "{**catch-all}" } } },
//   "Clusters": { "legacy": { "Destinations": { "iis": { "Address": "https://legacy.internal/" } } } }
// }
