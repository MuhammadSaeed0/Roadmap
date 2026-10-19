// Program.cs — retry transient errors (including deadlock victim 1205)
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(connectionString, sql => sql.EnableRetryOnFailure(
        maxRetryCount: 3,
        maxRetryDelay: TimeSpan.FromSeconds(2),
        errorNumbersToAdd: null)));

// Prevention: every code path touches tables in the SAME order
// PlaceOrder:  UPDATE Products ... ; INSERT Orders ...
// CancelOrder: UPDATE Products ... ; UPDATE Orders ...   (not Orders first!)

// Find recent deadlock graphs:
// SELECT xed.value('@timestamp', 'datetime2') AS [When], xed.query('.') AS Graph
// FROM (SELECT CAST(target_data AS xml) AS t FROM sys.dm_xe_session_targets st
//       JOIN sys.dm_xe_sessions s ON s.address = st.event_session_address
//       WHERE s.name = 'system_health' AND st.target_name = 'ring_buffer') AS d
// CROSS APPLY t.nodes('RingBufferTarget/event[@name="xml_deadlock_report"]') AS x(xed);
