public static class Tests
{
    private static readonly List<Employee> People = Data.Employees();

    [Test("Names in a department, sorted")] public static void Names() => Assert.SequenceEqual(["Khaled", "Mahmoud", "Salma"], Queries.NamesInDepartment(People, "Engineering"));
    [Test("Unknown department: empty list")] public static void Unknown() => Assert.Equal(0, Queries.NamesInDepartment(People, "Legal").Count);
    [Test("Highest paid employee")] public static void Highest() => Assert.Equal("Salma", Queries.HighestPaid(People)?.Name);
    [Test("Average salary per department")]
    public static void Averages()
    {
        var a = Queries.AverageSalaryByDepartment(People);
        Assert.Equal(23750m, a["Sales"]);
        Assert.Equal(30666.67m, a["Engineering"]);
        Assert.Equal(3, a.Count);
    }
    [Test("Hired after a year")] public static void Hired() => Assert.Equal(3, Queries.HiredAfter(People, 2020));
}
