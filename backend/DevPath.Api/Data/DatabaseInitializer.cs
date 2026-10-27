using DevPath.Api.Data.Seeding;
using Microsoft.EntityFrameworkCore;

namespace DevPath.Api.Data;

public static class DatabaseInitializer
{
    /// <summary>
    /// Applies pending EF Core migrations (when enabled in configuration) and then runs
    /// the idempotent content seeder. Safe to run on every start-up.
    /// </summary>
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DatabaseInitializer");
        var config = app.Configuration;

        try
        {
            if (config.GetValue("Database:MigrateOnStartup", true) && db.Database.IsRelational())
            {
                var pending = (await db.Database.GetPendingMigrationsAsync()).ToList();
                if (pending.Count > 0)
                {
                    logger.LogInformation("Applying {Count} pending migration(s): {Migrations}", pending.Count, string.Join(", ", pending));
                    await db.Database.MigrateAsync();
                }
            }

            if (config.GetValue("Database:SeedOnStartup", true))
                await scope.ServiceProvider.GetRequiredService<DbSeeder>().SeedAsync();

            // Explicit, one-time handover of data saved before accounts existed (see LegacyData).
            if (config["LegacyData:AssignToEmail"] is { Length: > 0 } email)
                await LegacyData.AssignAsync(db, email, logger);
        }
        catch (Exception ex) when (ex is Microsoft.Data.SqlClient.SqlException or InvalidOperationException)
        {
            logger.LogCritical(ex,
                "Could not initialise the database. Check that SQL Server (or LocalDB) is running and that " +
                "ConnectionStrings:DevPath in appsettings.json is correct. See README → Troubleshooting.");
            throw;
        }
    }
}
