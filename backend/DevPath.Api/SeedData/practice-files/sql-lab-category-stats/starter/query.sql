-- Categories with 3+ products: Category, Products, AveragePrice
SELECT c.Name AS Category, COUNT(*) AS Products
FROM Categories c
JOIN Products p ON p.CategoryId = c.Id
GROUP BY c.Name;
