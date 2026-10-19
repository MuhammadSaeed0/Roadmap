-- "Orders are timing out!" — who is waiting on whom right now?
SELECT r.session_id, r.blocking_session_id, r.wait_type, r.wait_time / 1000 AS wait_s,
       DB_NAME(r.database_id) AS db, s.program_name, t.text AS running_sql
FROM sys.dm_exec_requests AS r
JOIN sys.dm_exec_sessions AS s ON s.session_id = r.session_id
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) AS t
WHERE s.is_user_process = 1
ORDER BY r.wait_time DESC;

-- Timeline questions:
--   What was deployed, and when?        (release notes, git log)
--   When did errors start?              (logs grouped by minute)
--   Which endpoint / traceId?           (API request logs)
--   Is it the database?                 (blocking, top queries in Query Store)
