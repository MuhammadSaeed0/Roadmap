-- Other customers who bought every product customer 9 bought
SELECT DISTINCT c.Name
FROM Customers c
JOIN Orders o ON o.CustomerId = c.Id
WHERE c.Id <> 9
ORDER BY c.Name;
