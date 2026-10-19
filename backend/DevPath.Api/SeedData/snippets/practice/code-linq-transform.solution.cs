List<string> result = employees
    .Where(e => e.IsActive && e.Department == "Sales" && e.Salary > 10_000m)
    .OrderByDescending(e => e.Salary)
    .Select(e => e.Name.ToUpperInvariant())
    .ToList();
// ["OMAR", "SARA"]
