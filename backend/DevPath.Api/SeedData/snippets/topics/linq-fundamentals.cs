// The same query in SQL (you will learn it in phase 5):
//      SELECT TOP 5 Name, Salary FROM Employees
//      WHERE Department = 'IT' ORDER BY Salary DESC
var top = employees
    .Where(e => e.Department == "IT")
    .OrderByDescending(e => e.Salary)
    .Take(5)
    .Select(e => new { e.Name, e.Salary })
    .ToList();

bool anyInactive = employees.Any(e => !e.IsActive);       // EXISTS
int itCount = employees.Count(e => e.Department == "IT"); // COUNT(*)
var first = employees.FirstOrDefault(e => e.Id == 7);     // null if not found
