-- Highest-paid active employee per department (use a window function)
SELECT d.Name AS Department, MAX(e.Salary) AS Salary
FROM Employees e
JOIN Departments d ON d.Id = e.DepartmentId
GROUP BY d.Name;
