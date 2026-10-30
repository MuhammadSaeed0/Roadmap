-- INNER JOIN: products together with their category
SELECT p.Name, c.Name AS Category
FROM Products p
JOIN Categories c ON c.Id = p.CategoryId;

-- LEFT JOIN: every category, even those without products
SELECT c.Name AS Category, p.Name AS Product
FROM Categories c
LEFT JOIN Products p ON p.CategoryId = c.Id
ORDER BY c.Name;

-- Categories that have no products at all
SELECT c.Name
FROM Categories c
LEFT JOIN Products p ON p.CategoryId = c.Id
WHERE p.Id IS NULL;
