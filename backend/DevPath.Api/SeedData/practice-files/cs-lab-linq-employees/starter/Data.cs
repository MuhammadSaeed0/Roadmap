public record Employee(string Name, string Department, decimal Salary, int HireYear);

public static class Data
{
    public static List<Employee> Employees() =>
    [
        new("Salma", "Engineering", 41000, 2019),
        new("Mahmoud", "Engineering", 30000, 2021),
        new("Khaled", "Engineering", 21000, 2024),
        new("Aya", "Sales", 29000, 2020),
        new("Mostafa", "Sales", 18500, 2023),
        new("Ola", "Marketing", 39000, 2019),
    ];
}
