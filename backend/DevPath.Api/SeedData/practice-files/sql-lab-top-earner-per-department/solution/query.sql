WITH ranked AS (
    SELECT e.*, ROW_NUMBER() OVER (PARTITION BY e.DepartmentId ORDER BY e.Salary DESC) AS rn
    FROM Employees e
    WHERE e.IsActive = 1
)
SELECT d.Name AS Department, r.FirstName || ' ' || r.LastName AS Employee, r.Salary
FROM ranked r
JOIN Departments d ON d.Id = r.DepartmentId
WHERE r.rn = 1
ORDER BY d.Name;
