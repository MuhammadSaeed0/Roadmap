public static class Queries
{
    public static List<string> NamesInDepartment(IEnumerable<Employee> employees, string department) =>
        employees.Where(e => e.Department == department).OrderBy(e => e.Name).Select(e => e.Name).ToList();

    public static Employee? HighestPaid(IEnumerable<Employee> employees) => employees.MaxBy(e => e.Salary);

    public static Dictionary<string, decimal> AverageSalaryByDepartment(IEnumerable<Employee> employees) =>
        employees.GroupBy(e => e.Department).ToDictionary(g => g.Key, g => Math.Round(g.Average(e => e.Salary), 2));

    public static int HiredAfter(IEnumerable<Employee> employees, int year) => employees.Count(e => e.HireYear > year);
}
