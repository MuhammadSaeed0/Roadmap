-- One value for the whole table
SELECT COUNT(*)           AS Products,
       SUM(Price * Stock) AS StockValue,
       MIN(Price)         AS Cheapest,
       MAX(Price)         AS MostExpensive
FROM Products;

-- One row per category
SELECT c.Name       AS Category,
       COUNT(p.Id)  AS Products,
       AVG(p.Price) AS AveragePrice
FROM Categories c
LEFT JOIN Products p ON p.CategoryId = c.Id
GROUP BY c.Name
HAVING COUNT(p.Id) > 0      -- filters groups, after grouping
ORDER BY Products DESC;
