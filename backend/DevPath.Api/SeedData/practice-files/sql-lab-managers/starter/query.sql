-- Active employees and their manager
SELECT e.FirstName, e.LastName, e.ManagerId
FROM Employees e
ORDER BY e.LastName;
