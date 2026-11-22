-- Every customer, with their order count (0 when they never ordered)
SELECT c.Id, c.Name, COUNT(o.Id) AS Orders
FROM Customers AS c
LEFT JOIN Orders AS o ON o.CustomerId = c.Id
GROUP BY c.Id, c.Name;

-- Only customers who never ordered
SELECT c.Id, c.Name
FROM Customers AS c
LEFT JOIN Orders AS o ON o.CustomerId = c.Id
WHERE o.Id IS NULL;
