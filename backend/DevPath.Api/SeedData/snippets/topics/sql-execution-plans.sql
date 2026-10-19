-- What EF Core actually sends (copied from the log), runnable in SSMS
EXEC sp_executesql
    N'SELECT [p].[Id], [p].[Name]
      FROM [Products] AS [p]
      WHERE [p].[Sku] = @__sku_0',
    N'@__sku_0 nvarchar(4000)',          -- ⚠ nvarchar vs a varchar(20) column
    @__sku_0 = N'KB-001';

-- Implicit conversion → index scan. Fix the mapping in EF Core:
--   e.Property(p => p.Sku).HasMaxLength(20).IsUnicode(false);
-- Now the parameter is varchar(20) and the plan uses an index seek.

SET STATISTICS IO, TIME ON;
