-- The columns you need, the rows that match, in the order you want
SELECT Name, Price
FROM Products
WHERE Stock > 0
  AND Price BETWEEN 10 AND 50
ORDER BY Price DESC, Name;

-- Text patterns and lists of values
SELECT * FROM Products WHERE Name LIKE 'Key%';   -- starts with "Key"
SELECT * FROM Products WHERE Id IN (1, 3, 5);

-- Only the first rows
SELECT TOP (3) Name, Price
FROM Products
ORDER BY Price DESC;
