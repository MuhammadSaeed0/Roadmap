public record Employee(string Name, string Department, decimal Salary, bool IsActive);

List<Employee> employees =
[
    new("Sara", "Sales", 14_000m, true),
    new("Omar", "Sales", 18_000m, true),
    new("Lina", "IT", 20_000m, true),
    new("Ali", "Sales", 9_000m, true),
    new("Huda", "Sales", 16_000m, false),
];

// TODO: names (upper-case) of active Sales employees earning > 10,000, highest salary first
List<string> result = /* your LINQ here */;
