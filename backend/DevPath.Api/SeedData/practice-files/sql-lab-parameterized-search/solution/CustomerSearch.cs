public record SqlCommandText(string Sql, Dictionary<string, object?> Parameters);

public static class CustomerSearch
{
    public static SqlCommandText Build(string name, string? city)
    {
        var parameters = new Dictionary<string, object?> { ["@name"] = "%" + EscapeLike(name) + "%" };
        var sql = "SELECT Id, Name, City FROM Customers WHERE Name LIKE @name ESCAPE '\\'";
        if (city is not null)
        {
            sql += " AND City = @city";
            parameters["@city"] = city;
        }
        return new SqlCommandText(sql + " ORDER BY Name", parameters);
    }

    // %, _ and [ typed by the user are matched literally, not as wildcards.
    private static string EscapeLike(string text) =>
        text.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_").Replace("[", "\\[");
}
