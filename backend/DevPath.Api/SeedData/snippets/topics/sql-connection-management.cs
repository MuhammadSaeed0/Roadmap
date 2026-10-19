// ✅ Disposed connections return to the pool immediately
await using (var connection = new SqlConnection(connectionString))
{
    await connection.OpenAsync(ct);
    // ... one unit of work
}

// ❌ Leak: never disposed → pool exhausted after 100 iterations
for (var i = 0; i < 1000; i++)
{
    var connection = new SqlConnection(connectionString);
    connection.Open();
}

// Who is connected?
// SELECT program_name, COUNT(*) AS sessions
// FROM sys.dm_exec_sessions WHERE is_user_process = 1
// GROUP BY program_name;
