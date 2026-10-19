public async Task RunAsync(CancellationToken ct)
{
    foreach (var region in regions)
    {
        await using var connection = new SqlConnection(config.GetConnectionString("Default"));
        await connection.OpenAsync(ct);
        await using var command = new SqlCommand("SELECT ... WHERE Region = @r", connection);
        command.Parameters.Add(new SqlParameter("@r", SqlDbType.NVarChar, 50) { Value = region });
        await using var reader = await command.ExecuteReaderAsync(ct);
        await WriteCsvAsync(reader, ct);
    }   // disposed → returned to the pool every iteration
}
