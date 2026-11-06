// Program.cs of an API hosted on Azure App Service.
using Azure.Identity;

var builder = WebApplication.CreateBuilder(args);

// Secrets come from Key Vault. On Azure, DefaultAzureCredential uses the Web App's managed identity;
// on your machine it uses your Visual Studio / Azure CLI sign-in. No password appears in code or pipelines.
if (builder.Configuration["KeyVault:Uri"] is { Length: > 0 } vaultUri)
    builder.Configuration.AddAzureKeyVault(new Uri(vaultUri), new DefaultAzureCredential());

builder.Services.AddDbContext<InventoryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Inventory"),   // secret "ConnectionStrings--Inventory"
        sql => sql.EnableRetryOnFailure()));                                        // Azure SQL can drop connections briefly

// Requests, dependencies (SQL, HTTP), exceptions and traces go to Application Insights through OpenTelemetry
// (package Azure.Monitor.OpenTelemetry.AspNetCore; the connection string is an App Service setting).
builder.Services.AddOpenTelemetry().UseAzureMonitor();

builder.Services.AddHealthChecks().AddDbContextCheck<InventoryDbContext>();
builder.Services.AddControllers();

var app = builder.Build();
app.MapHealthChecks("/health");      // the pipeline's smoke test and App Service health check call this
app.MapControllers();
app.Run();

// Deploy (from the CI/CD pipeline):
//   dotnet ef migrations bundle -o efbundle      then run ./efbundle against Azure SQL
//   azure/webapps-deploy@v3 to the "staging" slot, test /health, then swap staging into production.
