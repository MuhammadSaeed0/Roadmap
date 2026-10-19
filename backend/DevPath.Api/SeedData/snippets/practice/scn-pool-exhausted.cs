public class NightlyExport(IConfiguration config)
{
    public async Task RunAsync()
    {
        foreach (var region in regions)
        {
            var connection = new SqlConnection(config.GetConnectionString("Default"));
            await connection.OpenAsync();
            var command = new SqlCommand("SELECT ... WHERE Region = @r", connection);
            command.Parameters.AddWithValue("@r", region);
            var reader = await command.ExecuteReaderAsync();
            await WriteCsvAsync(reader);
            // connection is never closed
        }
    }
}
