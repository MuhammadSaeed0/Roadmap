SELECT c.Name AS Category, COUNT(*) AS Products, ROUND(AVG(p.Price), 2) AS AveragePrice
FROM Categories c
JOIN Products p ON p.CategoryId = c.Id
GROUP BY c.Name
HAVING COUNT(*) >= 3
ORDER BY Products DESC, Category;
