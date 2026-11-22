-- Unsafe: the input becomes part of the SQL text
-- EXEC('SELECT * FROM Products WHERE Name = ''' + @Name + '''');

-- Safe: the value travels as a parameter
EXEC sp_executesql
    N'SELECT * FROM Products WHERE Name = @Name',
    N'@Name nvarchar(100)',
    @Name = @Name;
