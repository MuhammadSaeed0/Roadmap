CREATE VIEW DepartmentSummary AS
SELECT d.Name AS Department,
       COUNT(e.Id) AS ActiveEmployees,
       COALESCE(SUM(e.Salary), 0) AS MonthlyPayroll
FROM Departments d
LEFT JOIN Employees e ON e.DepartmentId = d.Id AND e.IsActive = 1
GROUP BY d.Id, d.Name;
