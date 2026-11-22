-- The latest order of each customer
WITH Ranked AS (
    SELECT o.*, ROW_NUMBER() OVER (PARTITION BY o.CustomerId ORDER BY o.OrderDate DESC, o.Id DESC) AS rn
    FROM Orders AS o
)
SELECT * FROM Ranked WHERE rn = 1;
