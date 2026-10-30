WITH bought AS (
    SELECT DISTINCT o.CustomerId, l.ProductId
    FROM Orders o
    JOIN OrderLines l ON l.OrderId = o.Id
    WHERE o.Status <> 'Cancelled'
),
ali AS (SELECT ProductId FROM bought WHERE CustomerId = 9)
SELECT c.Name
FROM bought b
JOIN ali s ON s.ProductId = b.ProductId
JOIN Customers c ON c.Id = b.CustomerId
WHERE b.CustomerId <> 9
GROUP BY c.Id, c.Name
HAVING COUNT(DISTINCT b.ProductId) = (SELECT COUNT(*) FROM ali)
ORDER BY c.Name;
