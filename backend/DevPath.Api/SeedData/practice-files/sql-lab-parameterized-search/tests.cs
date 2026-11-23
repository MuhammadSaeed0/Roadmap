public static class Tests
{
    [Test("The user's text is never part of the SQL")]
    public static void NoValuesInSql()
    {
        var command = CustomerSearch.Build("O'Brien'; DROP TABLE Customers; --", "Cairo");
        Assert.False(command.Sql.Contains("O'Brien"), "the name must be sent as a parameter");
        Assert.False(command.Sql.Contains("Cairo"), "the city must be sent as a parameter");
        Assert.True(command.Sql.Contains("@name") && command.Sql.Contains("@city"), "the SQL should use @name and @city");
    }

    [Test("The same SQL text for different searches (one cached plan)")]
    public static void PlanReuse() =>
        Assert.Equal(CustomerSearch.Build("Sara", null).Sql, CustomerSearch.Build("Omar", null).Sql);

    [Test("@name holds the LIKE pattern")]
    public static void NameParameter() => Assert.Equal("%Sara%", CustomerSearch.Build("Sara", null).Parameters["@name"]);

    [Test("@city is added only when a city is given")]
    public static void OptionalCity()
    {
        Assert.False(CustomerSearch.Build("Sara", null).Parameters.ContainsKey("@city"), "no city, no @city");
        Assert.Equal("Giza", CustomerSearch.Build("Sara", "Giza").Parameters["@city"]);
    }
}
