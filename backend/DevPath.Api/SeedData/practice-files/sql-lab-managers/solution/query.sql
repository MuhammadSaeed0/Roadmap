SELECT e.FirstName, e.LastName, m.FirstName AS Manager
FROM Employees e
LEFT JOIN Employees m ON m.Id = e.ManagerId
WHERE e.IsActive = 1
ORDER BY e.LastName;
