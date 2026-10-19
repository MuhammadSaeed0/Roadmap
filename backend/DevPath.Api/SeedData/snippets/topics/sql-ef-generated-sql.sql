-- Tag the connection so you can find this app's queries
--   Server=...;Database=DevPath;Application Name=DevPath;...

CREATE EVENT SESSION DevPathQueries ON SERVER
ADD EVENT sqlserver.rpc_completed (
    ACTION (sqlserver.client_app_name, sqlserver.query_hash, sqlserver.sql_text)
    WHERE sqlserver.client_app_name = N'DevPath')
ADD TARGET package0.ring_buffer;
GO
ALTER EVENT SESSION DevPathQueries ON SERVER STATE = START;

-- Common EF Core shapes to recognise:
--   OUTER APPLY / LEFT JOIN       → projections of related collections
--   OPENJSON(@ids)                → ids.Contains(x.Id)
--   OFFSET @p ROWS FETCH NEXT @n  → Skip/Take
