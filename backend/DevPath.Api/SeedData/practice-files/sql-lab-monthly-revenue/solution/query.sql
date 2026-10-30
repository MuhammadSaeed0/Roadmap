SELECT MONTH(o.OrderDate) AS Month,
       COUNT(DISTINCT o.Id) AS Orders,
       ROUND(SUM(l.Quantity * l.UnitPrice), 2) AS Revenue
FROM Orders o
JOIN OrderLines l ON l.OrderId = o.Id
WHERE YEAR(o.OrderDate) = 2025 AND o.Status <> 'Cancelled'
GROUP BY MONTH(o.OrderDate)
ORDER BY Month;
