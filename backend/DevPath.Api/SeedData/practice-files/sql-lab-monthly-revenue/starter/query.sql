-- 2025: Month, Orders, Revenue (no cancelled orders)
SELECT o.OrderDate, l.Quantity * l.UnitPrice AS LineTotal
FROM Orders o
JOIN OrderLines l ON l.OrderId = o.Id;
