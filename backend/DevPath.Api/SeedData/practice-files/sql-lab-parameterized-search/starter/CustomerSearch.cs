public record SqlCommandText(string Sql, Dictionary<string, object?> Parameters);

public static class CustomerSearch
{
    // Builds the query for the customers search box. Today it pastes the user's text into the SQL:
    // that allows SQL injection and a new plan for every different search.
    // Rewrite it to use parameters: @name (with % around it for LIKE) and, when city is given, @city.
    public static SqlCommandText Build(string name, string? city)
    {
        var sql = "SELECT Id, Name, City FROM Customers WHERE Name LIKE '%" + name + "%'";
        if (city is not null) sql += " AND City = '" + city + "'";
        return new SqlCommandText(sql + " ORDER BY Name", new Dictionary<string, object?>());
    }
}
