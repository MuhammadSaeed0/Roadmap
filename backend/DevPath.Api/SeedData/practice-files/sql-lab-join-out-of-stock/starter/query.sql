-- Out-of-stock products and their category name
SELECT Name, CategoryId
FROM Products
WHERE Stock = 0;
