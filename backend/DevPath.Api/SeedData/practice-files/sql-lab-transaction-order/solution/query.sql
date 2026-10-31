BEGIN TRANSACTION;

INSERT INTO Orders (CustomerId, OrderDate, Status) VALUES (3, '2025-10-10', 'Pending');

INSERT INTO OrderLines (OrderId, ProductId, Quantity, UnitPrice)
SELECT (SELECT MAX(Id) FROM Orders), Id, 2, Price FROM Products WHERE Name = 'Headset';

UPDATE Products SET Stock = Stock - 2 WHERE Name = 'Headset';

COMMIT;
