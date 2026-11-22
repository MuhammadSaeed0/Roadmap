-- Customers with more than 5 orders in 2025
SELECT CustomerId, COUNT(*) AS Orders
FROM Orders
WHERE OrderDate >= '2025-01-01' AND OrderDate < '2026-01-01'   -- rows, before grouping
GROUP BY CustomerId
HAVING COUNT(*) > 5                                            -- groups, after grouping
ORDER BY Orders DESC;
