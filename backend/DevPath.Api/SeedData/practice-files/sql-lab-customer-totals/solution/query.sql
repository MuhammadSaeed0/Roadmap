SELECT TOP 5 c.Name AS Customer, ROUND(SUM(l.Quantity * l.UnitPrice), 2) AS Spent
FROM Customers c
JOIN Orders o ON o.CustomerId = c.Id
JOIN OrderLines l ON l.OrderId = o.Id
WHERE o.Status <> 'Cancelled'
GROUP BY c.Id, c.Name
ORDER BY Spent DESC;
