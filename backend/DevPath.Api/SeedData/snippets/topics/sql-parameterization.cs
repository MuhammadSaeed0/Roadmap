// ADO.NET with explicit parameter types (matches a varchar(20) column)
await using var connection = new SqlConnection(connectionString);
await using var command = new SqlCommand("SELECT Id, Name FROM Products WHERE Sku = @sku", connection);
command.Parameters.Add(new SqlParameter("@sku", SqlDbType.VarChar, 20) { Value = sku });
await connection.OpenAsync(ct);
await using var reader = await command.ExecuteReaderAsync(ct);

// EF Core: the interpolated value becomes a parameter automatically
var products = await db.Products
    .FromSql($"SELECT * FROM Products WHERE Sku = {sku}")
    .ToListAsync(ct);
